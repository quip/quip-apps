// Copyright 2020 Quip

import {RootRecord} from "./model";

describe("Root Record", () => {
    let model: RootRecord;

    beforeEach(() => {
        model = new RootRecord();
    });

    test("is defined", () => {
        expect(model).toBeDefined();
    });
});
