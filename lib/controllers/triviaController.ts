import axios from "axios";
import { Request, Response } from "express";
import { Constants } from "../models/constants";
import { OpenTrivia } from "../models/opentrivia";

export class TriviaController {

    /**
     * 
     * @param request 
     * @param response 
     */
    public async GetQuestion(request: Request, response: Response): Promise<void> {
        let category = OpenTrivia.Category[request.params.category as any];

        if (!category) {
            // todo if category not found, create log
            response.sendStatus(400);
        }

        let { data, status } = await axios.get<OpenTrivia.Response>(
            Constants.TRIVIA_API, {
            params: {
                amount: 1,
                category: category
            }
        });

        if (data && data.results?.length == 1) {
            response.status(status).send(data.results.pop());
        }
        else {
            // todo implement analytics for logging
            response.sendStatus(500);
        }
    }
}