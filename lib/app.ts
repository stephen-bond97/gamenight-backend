import bodyParser from "body-parser";
import express from "express";
import http from "http";
import { RouteProvider } from "./routeProvider";

class App {
    public app: express.Application;
    public server: http.Server;
    public routeProvider = new RouteProvider();

    private readonly PORT = process.env.PORT || 3000;

    /**
     *
     */
    public constructor() {
        this.configureApp();
        this.configureServer();
        this.routeProvider.mapRoutes(this.app);
    }

    private configureApp() : void {
        this.app = express();
        
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
            console.log("Server is running on port %s", this.PORT);
        });
    }
}

export default new App();