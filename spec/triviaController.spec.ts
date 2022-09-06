import { TriviaController } from "../lib/controllers/triviaController";

process.env.ENVIRONMENT = "DEVELOPMENT";

describe('TriviaController', () => {

    let triviaController: TriviaController;

    beforeEach(() => {
        triviaController = new TriviaController();
    });

    it('should create', () => {
        expect(triviaController).toBeFalsy();
    });

});