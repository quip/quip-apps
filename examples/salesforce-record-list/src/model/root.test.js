// Copyright 2019 Quip

import {RootEntity} from "./root";

describe("Root Record", () => {
    test("fetching list types seeks ahead", async () => {
        const root = new RootEntity();
        const seekMock = jest.spyOn(root.client_, "getResponseProperties");
        seekMock.mockResolvedValue({
            data: {
                nextPageUrl: null,
            },
        });
        await root.fetchListTypes_();
        expect(seekMock).toHaveBeenCalledTimes(3);
        seekMock.mockClear();
    });
});
