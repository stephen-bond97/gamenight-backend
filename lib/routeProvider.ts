import { TriviaController } from "./controllers/triviaController";
import { Application, Request, Response } from "express";

export class RouteProvider {
    private trivia = new TriviaController();

    public mapRoutes(app: Application) : void {
        app.route("/health").get((req, res) => this.handleBaseRequest(req, res));
        app.route("/trivia/question").get((req, res) => this.trivia.GetQuestion(req, res));
    }

    private handleBaseRequest(request: Request, response: Response) : void {
        console.log("handling request");
        response.status(200).send({
            message: "Health check successful"
        });
    }
}