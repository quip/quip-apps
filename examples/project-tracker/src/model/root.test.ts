// Copyright 2020 Quip

import {RootRecord} from "./root";

describe("Root Record", () => {
    let model: RootRecord;

    beforeEach(() => {
        model = new RootRecord();
    });

    test("is defined", () => {
        expect(model).toBeDefined();
    });
});
