import * as SocketIO from "socket.io";
import * as http from "http";

export class SocketController {
    private io: SocketIO.Server;
    
    /**
     * creates a new instance of the socket controller class
     * @param server an existing active http server
     */
    public constructor(server: http.Server) {
        this.io = new SocketIO.Server(server);
        this.io.on("connect", socket => this.handleSocketConnection(socket));
    }

    private handleSocketConnection(socket: SocketIO.Socket) : void {
        socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleSocketDisconnect(socket: SocketIO.Socket) : void {
        //todo check if all participants have left and close lobby
        console.log("Client Disconnect");
    }
}