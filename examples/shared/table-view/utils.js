// Copyright 2017 Quip

export const ROW_START_HEIGHT = 45;
export const ROW_PADDING = 10;

const recordsToObj = (records, value) => {
    const recordsArr = Array.isArray(records) ? records : records.getRecords();
    return recordsArr.reduce((acc, record) => {
        acc[record.getId()] =
            typeof value === "function" ? value(record) : value;
        return acc;
    }, {});
};

export const getHeights = ({columns, rows}, values = {}) =>
    recordsToObj(rows, row => {
        return values[row.getId()] || recordsToObj(columns, ROW_START_HEIGHT);
    });

export const getWidths = (
    {columns},
    values = {},
    getDefaultWidth,
    getMinWidth) =>
    recordsToObj(columns, column => {
        const id = column.getId();
        const value = values[id];
        const type = column.get("type");

        if (value)
            return value < getMinWidth(id, type)
                ? getMinWidth(id, type)
                : value;
        const defaultWidth = getDefaultWidth(column);
        return defaultWidth;
    });
