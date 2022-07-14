export namespace OpenTrivia {
    interface RequestParams {
        amount: number;
        category: number;
    }

    export interface Response {
        response_code: number;
        results: Question[];
    }

    interface Question {
        category: string;
        type: string;
        difficulty: string;
        question: string;
        correct_answer: string;
        incorrect_answers: string[];
    }

    export enum Category {
        generalknowledge = 9,
        books = 10,
        cinema = 11,
        music = 12,
        musicalsandtheatre = 13,
        television = 14,
        videogames = 15,
        boardgames = 16,
        scienceandnature = 17,
        computing = 18,
        mathematics = 19,
        mythology = 20,
        sports = 21,
        geography = 22,
        history = 23,
        politics = 24,
        art = 25,
        celebrities = 26,
        animals = 27,
        vehicles = 28,
        comics = 29,
        gadgets = 30,
        anime = 31,
        animation = 32
    }
}