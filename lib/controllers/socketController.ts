import * as SocketIO from "socket.io";
import * as http from "http";
import { ILogger } from "../logging/ilogger";
import { LoggerFactory } from "../logging/logger.factory";

enum Request {
    CreateLobby = 'create-lobby',
    JoinLobby = 'join-lobby',
    ShareInformation = 'share-information',
    SynchroniseLobby = 'synchronise-lobby',
    CloseLobby = 'close-lobby'
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
        this.logger.Info("Socket Server listening on port 3000");
    }

    //#region socket handlers

    private handleSocketConnection(socket: SocketIO.Socket): void {
        socket.on(Request.CreateLobby, () => this.handleCreateLobbyRequest(socket));
        socket.on(Request.JoinLobby, (lobbyCode: string) => this.handleJoinLobbyRequest(socket, lobbyCode));
        socket.on(Request.ShareInformation, (data: string) => this.handleShareInformationRequest(socket, data));
        socket.on(Request.SynchroniseLobby, (data: string) => this.handleLobbySynchroniseRequest(socket, data));
        socket.on(Request.CloseLobby, (lobbyCode) => this.closeLobby(lobbyCode));
        socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleCreateLobbyRequest(socket: SocketIO.Socket): void {
        if (this.lobbies.length >= parseInt(process.env.MAX_LOBBY_COUNT || "10")) {
            this.logger.Warning("The max lobby count has been exceeded");
            socket.emit(Response.Exception, "The max lobby count has been exceeded.");
            return;
        }

        let lobbyCode = this.generateLobbyCode();
        this.logger.Debug(`${lobbyCode}: lobby code has been generated`);

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
        this.logger.Info("attempting to join lobby");
        
        if (!this.lobbies.includes(lobbyCode)) {
            this.logger.Warning(`Lobby not found: ${lobbyCode}`);
            socket.emit(Response.Exception, `Lobby not found: ${lobbyCode}`);
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
        this.logger.Debug("sharing information");
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
        this.logger.Debug("Socket disconnected");
    }

    //#endregion

    private closeLobby(lobbyCode: string): void {
        let index = this.lobbies.indexOf(lobbyCode);
        if (index == -1) {
            return;
        }

        this.socketServer.in(lobbyCode).emit(Response.Exception, "Game has ended");

        this.lobbies.splice(index, 1);
        this.socketServer.in(lobbyCode).emit(Response.LobbyClosed);
        this.socketServer.in(lobbyCode).socketsLeave(lobbyCode);

        this.logger.Info(`${lobbyCode}: lobby has been closed`);
    }

    private generateLobbyCode(): string {
        return Math.random().toString(36).substring(2, 7);
    }
}