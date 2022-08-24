import axios from "axios";
import { Request, Response } from "express";
import { ILogger } from "../logging/ilogger";
import { LoggerFactory } from "../logging/logger.factory";
import { Constants } from "../models/constants";
import { OpenTrivia } from "../models/opentrivia";

export class TriviaController {
    private logger: ILogger;
    
    /**
     *
     */
    public constructor() {
        this.logger = LoggerFactory.CreateLogger();
    }


    /**
     * 
     * @param request 
     * @param response 
     */
    public async GetQuestion(request: Request, response: Response): Promise<void> {
        let category = OpenTrivia.Category[request.query.category as any];

        if (!category) {
            this.logger.Info(`Category not found: ${request.query.category}`);
            response.sendStatus(400);
            return;
        }

        let { data, status } = await axios.get<OpenTrivia.Response>(
            Constants.TRIVIA_API, {
            params: {
                amount: 1,
                category: category
            },
        });

        if (data && data.results?.length == 1) {
            this.logger.Debug("Trivia question found");
            response.status(status).send(data.results.pop());
            return;
        }
        else {
            this.logger.Error(`Open Trivia DB response status: ${status}`);
            response.sendStatus(500);
            return;
        }
    }
}