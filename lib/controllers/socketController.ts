import * as SocketIO from "socket.io";
import * as http from "http";
import { request, response } from "express";

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
        socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleCreateLobbyRequest(socket: SocketIO.Socket) : void {
        let lobbyCode = this.generateLobbyCode();

        this.handleJoinLobbyRequest(socket, lobbyCode);
        socket.emit(Response.LobbyCreated, lobbyCode);
        // todo figure out what to do if the host disconnects
    }

    private handleJoinLobbyRequest(socket: SocketIO.Socket, lobbyCode: string) : void {
        socket.join(lobbyCode);

        socket.emit(Response.LobbyJoined);
    }

    private handleSocketDisconnect(socket: SocketIO.Socket) : void {
        //todo check if all participants have left and close lobby
        console.log("Client Disconnect");
    }

    //#endregion

    private generateLobbyCode() : string {
        return Math.random().toString(36).substring(2, 5);
    }
}