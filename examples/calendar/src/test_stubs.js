// Copyright 2017 Quip

import type { EventRecord } from "./model";

export const stubEventRecord = ({
    start,
    end,
}: {
    start: Date,
    end: Date,
    order?: number,
}): EventRecord => ({
    getDateRange: () => ({
        start,
        end,
    }),
});
