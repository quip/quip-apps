// Copyright 2017 Quip
import {EventRecord} from "./model";
export type MouseCoordinates = {
    x: number;
    y: number;
};
export type MouseStartCoordinates = {
    x: number;
    y: number;
    date: Date;
};
export type DateRange = {
    start: Date;
    end: Date;
};
export type MovingEventRect = {
    height: number;
    left: number;
    top: number;
    width: number;
};
export type MovingEventRectMap = {
    [x: number]: MovingEventRect;
};
export type MovingEventOrder = {
    closestEvent: EventRecord | undefined | null;
    index: number;
    isBefore?: boolean;
};
