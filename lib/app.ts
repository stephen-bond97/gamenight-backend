import bodyParser from "body-parser";
import { SocketController } from "./controllers/socketController";
import express from "express";
import cors from "cors";
import http from "http";
import { RouteProvider } from "./routeProvider";
import "dotenv/config";
import { ILogger } from "./logging/ilogger";
import { LoggerFactory } from "./logging/logger.factory";

class App {
    public app: express.Application;
    public server: http.Server;
    public routeProvider = new RouteProvider();
    public socketController: SocketController;

    private readonly PORT = process.env.PORT || 3000;
    private logger: ILogger;

    /**
     *
     */
    public constructor() {
        this.configureApp();
        this.configureServer();
        this.configureSockets();
        this.routeProvider.mapRoutes(this.app);
        this.logger = LoggerFactory.CreateLogger();
    }

    private configureApp() : void {
        this.app = express();

        this.app.use(cors({
            origin: process.env.BASE_URL
          }));
        
        // opening up public directory for HTTP get requests
        this.app.use(express.static("lib/public"));

        // adding support for JSON post data
        this.app.use(bodyParser.json());

        // adding support for URL encoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private configureServer() : void {
        this.server = http.createServer(this.app);
        this.server.listen(this.PORT, () => {
            this.logger.Info(`Server is running on port ${this.PORT}`);
        });
    }

    private configureSockets(): void {
        this.socketController = new SocketController(this.server);
    }
}

export default new App();