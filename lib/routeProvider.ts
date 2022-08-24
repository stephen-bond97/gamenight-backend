import { TriviaController } from "./controllers/triviaController";
import { Application, Request, Response } from "express";
import { ILogger } from "./logging/ilogger";
import { LoggerFactory } from "./logging/logger.factory";

export class RouteProvider {
    private trivia = new TriviaController();
    private logger: ILogger;

    /**
     *
     */
    constructor() {
        this.logger = LoggerFactory.CreateLogger();
    }

    public mapRoutes(app: Application) : void {
        app.route("/health").get((req, res) => this.handleBaseRequest(req, res));
        app.route("/trivia/question").get((req, res) => this.trivia.GetQuestion(req, res));
    }

    private handleBaseRequest(request: Request, response: Response) : void {
        this.logger.Debug("Handling health check request");
        response.status(200).send({
            message: "Health check successful"
        });
    }
}