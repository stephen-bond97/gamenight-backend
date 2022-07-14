import * as SocketIO from "socket.io";
import * as http from "http";

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

    private handleSocketConnection(socket: SocketIO.Socket) : void {
        socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleSocketDisconnect(socket: SocketIO.Socket) : void {
        //todo check if all participants have left and close lobby
        console.log("Client Disconnect");
    }
}