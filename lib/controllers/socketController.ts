import * as SocketIO from "socket.io";
import * as http from "http";
import { ILogger } from "../logging/ilogger";
import { LoggerFactory } from "../logging/logger.factory";

enum Request {
    CreateLobby = 'create-lobby',
    JoinLobby = 'join-lobby',
    ShareInformation = 'share-information',
    SynchroniseLobby = 'synchronise-lobby'
}

enum Response {
    LobbyCreated = 'lobby-created',
    LobbyClosed = 'lobby-closed',
    LobbyJoined = 'lobby-joined',
    InformationShared = 'information-shared',
    LobbySynchronised = 'lobby-synchronised',
    Exception = 'exception'
}

export class SocketController {
    private socketServer: SocketIO.Server;
    private lobbies: string[] = [];
    private logger: ILogger;

    /**
     * creates a new instance of the socket controller class
     * @param server an existing active http server
     */
    public constructor(httpServer: http.Server) {
        this.logger = LoggerFactory.CreateLogger();
        this.socketServer = new SocketIO.Server(httpServer, {
            cors: {
                origin: process.env.BASE_URL,
                methods: ["GET", "POST"]
            }
        });
        this.socketServer.on("connect", socket => this.handleSocketConnection(socket));
    }

    //#region socket handlers

    private handleSocketConnection(socket: SocketIO.Socket): void {
        socket.on(Request.CreateLobby, () => this.handleCreateLobbyRequest(socket));
        socket.on(Request.JoinLobby, (lobbyCode: string) => this.handleJoinLobbyRequest(socket, lobbyCode));
        socket.on(Request.ShareInformation, (data: string) => this.handleShareInformationRequest(socket, data));
        socket.on(Request.SynchroniseLobby, (data: string) => this.handleLobbySynchroniseRequest(socket, data));
        socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleCreateLobbyRequest(socket: SocketIO.Socket): void {
        if (this.lobbies.length >= parseInt(process.env.MAX_LOBBY_COUNT || "10")) {
            this.logger.Warning("The max lobby count has been exceeded.");
            socket.emit(Response.Exception, "The max lobby count has been exceeded.");
            return;
        }

        let lobbyCode = this.generateLobbyCode();

        // check if socket is already is part of any active lobbies and interate through to remove lobby
        if (socket.rooms.size > 1) {
            socket.rooms.forEach((value: string) => {
                this.closeLobby(value);
            });
        }

        this.lobbies.push(lobbyCode);
        this.handleJoinLobbyRequest(socket, lobbyCode);
        socket.emit(Response.LobbyCreated, lobbyCode);

        socket.on("disconnect", () => this.closeLobby(lobbyCode));
    }

    private handleJoinLobbyRequest(socket: SocketIO.Socket, lobbyCode: string): void {
        if (!this.lobbies.includes(lobbyCode)) {
            this.logger.Warning(`Lobby not found: ${lobbyCode}`);
            return;
        }

        socket.join(lobbyCode);

        socket.emit(Response.LobbyJoined);
    }

    /**
     * Connected peers will share information and the host will be listening for this response
     * @param socket The socket connection raising this event
     * @param data The serialised JSON data
     */
    private handleShareInformationRequest(socket: SocketIO.Socket, data: string): void {
        console.log(data);
        socket.broadcast.emit(Response.InformationShared, data);
    }

    /**
     * Host will broadcast the synchronisation event and peers will be listening for the response
     * @param socket The socket connection raising this event
     * @param data The serialised JSON data
     */
    private handleLobbySynchroniseRequest(socket: SocketIO.Socket, data: string): void {
        socket.broadcast.emit(Response.LobbySynchronised, data);
    }

    private handleSocketDisconnect(socket: SocketIO.Socket): void {
        // todo alert the host that a player has left
        console.log("Client Disconnect");
    }

    //#endregion

    private closeLobby(lobbyCode: string): void {
        let index = this.lobbies.indexOf(lobbyCode);
        if (index == -1) {
            return;
        }

        this.lobbies.splice(index, 1);
        this.socketServer.in(lobbyCode).emit(Response.LobbyClosed);
        this.socketServer.in(lobbyCode).socketsLeave(lobbyCode);
    }

    private generateLobbyCode(): string {
        return Math.random().toString(36).substring(2, 7);
    }
}