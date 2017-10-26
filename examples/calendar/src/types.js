/* @flow */
// Copyright 2017 Quip

import type { EventRecord } from "./model";

export type MouseCoordinates = {
    x: number,
    y: number,
};

export type MouseStartCoordinates = {
    x: number,
    y: number,
    date: Date,
};

export type DateRange = {
    start: Date,
    end: Date,
};

export type MovingEventRect = {
    height: number,
    left: number,
    top: number,
    width: number,
};

export type MovingEventRectMap = {
    [number]: MovingEventRect,
};

export type MovingEventOrder = {
    closestEvent: ?EventRecord,
    index: number,
    isBefore?: boolean,
};
