// Copyright 2020 Quip

import {BoardRecord} from "./model";

describe("Root Record", () => {
    let model: BoardRecord;

    beforeEach(() => {
        model = new BoardRecord();
    });

    test("is defined", () => {
        expect(model).toBeDefined();
    });
});
