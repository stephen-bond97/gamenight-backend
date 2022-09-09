import { TriviaController } from "../lib/controllers/triviaController";

process.env.ENVIRONMENT = "DEVELOPMENT";

class RequestSpy {
    query = {
        category: "videogames"
    };
}

class ResponseSpy {
    status = jasmine.createSpy("status");
    sendStatus = jasmine.createSpy("sendStatus");
}

fdescribe('TriviaController', () => {

    let triviaController: TriviaController;

    beforeEach(() => {
        triviaController = new TriviaController();
    });

    it('should create', () => {
        expect(triviaController).toBeTruthy();
    });

    it('should return a 400 when category is not found', () => {
        let req = new RequestSpy();
        let res = new ResponseSpy();

        req.query.category = "";

        triviaController.GetQuestion(req as any, res as any);
        expect(res.sendStatus).toHaveBeenCalledOnceWith(400);
    });
});