import * as SocketIO from "socket.io";
import * as http from "http";
import { Logger } from "../logger";

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
    LobbySynchronised = 'lobby-synchronised'
}

export class SocketController {
    private socketServer: SocketIO.Server;
    private lobbies: string[] = [];

    /**
     * creates a new instance of the socket controller class
     * @param server an existing active http server
     */
    public constructor(httpServer: http.Server) {
        this.socketServer = new SocketIO.Server(httpServer, {
            cors: {
                origin: process.env.BASE_URL,
                methods: ["GET", "POST"]
            }
        });
        this.socketServer.on("connect", socket => this.handleSocketConnection(socket));
    }

    //#region socket handlers

    private handleSocketConnection(socket: SocketIO.Socket) : void {
        socket.on(Request.CreateLobby, () => this.handleCreateLobbyRequest(socket));
        socket.on(Request.JoinLobby, (lobbyCode: string) => this.handleJoinLobbyRequest(socket, lobbyCode));
        socket.on(Request.ShareInformation, (data: string) => this.handleShareInformationRequest(socket, data));
        socket.on(Request.SynchroniseLobby, (data: string) => this.handleLobbySynchroniseRequest(socket, data));
        //socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleCreateLobbyRequest(socket: SocketIO.Socket) : void {
        let lobbyCode = this.generateLobbyCode();

        this.lobbies.push(lobbyCode);
        this.handleJoinLobbyRequest(socket, lobbyCode);
        socket.emit(Response.LobbyCreated, lobbyCode);

        socket.on("disconnect", () => this.closeLobby(lobbyCode));
    }

    private handleJoinLobbyRequest(socket: SocketIO.Socket, lobbyCode: string) : void {
        if (!this.lobbies.includes(lobbyCode)) {
            Logger.Warning(`Lobby not found: ${lobbyCode}`);
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
    private handleShareInformationRequest(socket: SocketIO.Socket, data: string) : void {
        console.log(data);
        socket.broadcast.emit(Response.InformationShared, data);
    }

    /**
     * Host will broadcast the synchronisation event and peers will be listening for the response
     * @param socket The socket connection raising this event
     * @param data The serialised JSON data
     */
    private handleLobbySynchroniseRequest(socket: SocketIO.Socket, data: string) : void {
        socket.broadcast.emit(Response.LobbySynchronised, data);
    }

    private handleSocketDisconnect(socket: SocketIO.Socket) : void {
        // todo alert the host that a player has left
        console.log("Client Disconnect");
    }

    //#endregion

    private closeLobby(lobbyCode: string) : void {
        this.socketServer.in(lobbyCode).socketsLeave(lobbyCode);
        let index = this.lobbies.indexOf(lobbyCode);
        this.lobbies.splice(index, 1);
    }

    private generateLobbyCode() : string {
        return Math.random().toString(36).substring(2, 7);
    }
}