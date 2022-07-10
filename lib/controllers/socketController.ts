import * as SocketIO from "socket.io";
import * as http from "http";

export class SocketController {
    private socketServer: SocketIO.Server;
    
    /**
     * creates a new instance of the socket controller class
     * @param server an existing active http server
     */
    public constructor(httpServer: http.Server) {
        console.log(`${process.env.BASE_URL}:${process.env.PORT}`);
        this.socketServer = new SocketIO.Server(httpServer, {
            cors: {
                origin: `${process.env.BASE_URL}:${process.env.PORT}`,
                methods: ["GET", "POST"]
            }
        });
        this.socketServer.on("connect", socket => this.handleSocketConnection(socket));
    }

    private handleSocketConnection(socket: SocketIO.Socket) : void {
        socket.on("message", () => socket.broadcast.emit("message", "received"));
        socket.on("disconnect", () => this.handleSocketDisconnect(socket));
    }

    private handleSocketDisconnect(socket: SocketIO.Socket) : void {
        //todo check if all participants have left and close lobby
        console.log("Client Disconnect");
    }
}