// Copyright 2019 Quip

import React from "react";
import {Datepicker, SLDSCheckbox} from "@salesforce/design-system-react";
import {mount, shallow} from "enzyme";

import Cell from "./cell";
import {
    SalesforceListCellData,
    SalesforceListCellSchema,
} from "../model/salesforce-list";
import {ColumnInfo} from "../lib/salesforce-responses";
import CellComment from "../model/cell-comment";
import CellTextInput from "./cell-text-input";
import {ReactNodeLike} from "prop-types";

const noop = () => {};
const exampleColumn: ColumnInfo = {
    fieldApiName: "test",
    label: "test",
    sortable: true,
};
const exampleData: SalesforceListCellData = {
    id: "aaa",
    relativeUrl: "http://test.com",
    dirtyValue: "",
    displayValue: null,
    value: "value",
    locked: false,
};
const exampleSchema: SalesforceListCellSchema = {
    defaultValue: "",
    dataType: "String",
};

describe("Cell component", () => {
    test("String value", () => {
        const wrapper = shallow(
            <Cell
                onChangeValue={noop}
                onResetValue={noop}
                onCreateComment={f => new CellComment()}
                onClickReference={noop}
                column={exampleColumn}
                data={exampleData}
                schema={exampleSchema}/>);
        expect(wrapper.find(".cell")).toHaveLength(1);
        expect(wrapper.find(CellTextInput)).toHaveLength(1);
        const children = wrapper
            .find(CellTextInput)
            .prop("children") as ReactNodeLike[];
        children.forEach(child => {
            expect(child).toBeNull();
        });
    });
    test("Boolean value", () => {
        const wrapper = shallow(
            <Cell
                onChangeValue={noop}
                onResetValue={noop}
                onCreateComment={f => new CellComment()}
                onClickReference={noop}
                column={exampleColumn}
                data={{...exampleData, value: "false"}}
                schema={{...exampleSchema, dataType: "Boolean"}}/>);
        const children = wrapper
            .find(CellTextInput)
            .prop("children") as ReactNodeLike[];
        expect(children).toMatchInlineSnapshot(`
            Array [
              <OldCheckbox
                checked={false}
                onChange={[Function]}
                readOnly={true}
              />,
              null,
            ]
        `);
        expect(wrapper.find(SLDSCheckbox).prop("checked")).toEqual(false);
    });
    test("With valid date value", () => {
        const wrapper = shallow(
            <Cell
                onChangeValue={noop}
                onResetValue={noop}
                onCreateComment={f => new CellComment()}
                onClickReference={noop}
                column={exampleColumn}
                data={{...exampleData, value: "01/21/1987"}}
                schema={{...exampleSchema, dataType: "Date"}}/>);
        expect(wrapper.find(Datepicker)).toHaveLength(1);
        expect(wrapper.find(Datepicker).find(CellTextInput)).toHaveLength(1);
        const val = wrapper.find(Datepicker).prop("value") as Date;
        expect(val).toEqual(expect.any(Date));
        expect(`${val.getDate()}${val.getMonth()}${val.getFullYear()}`).toEqual(
            "2101987");
    });
    test("With empty date value", () => {
        const wrapper = shallow(
            <Cell
                onChangeValue={noop}
                onResetValue={noop}
                onCreateComment={f => new CellComment()}
                onClickReference={noop}
                column={exampleColumn}
                data={{...exampleData, value: ""}}
                schema={{...exampleSchema, dataType: "Date"}}/>);
        expect(wrapper.find(Datepicker)).toHaveLength(1);
        expect(wrapper.find(Datepicker).find(CellTextInput)).toHaveLength(1);
        expect(wrapper.find(Datepicker).prop("value")).toMatchInlineSnapshot(
            `""`);
        expect(
            wrapper
                .find(Datepicker)
                .find(CellTextInput)
                .prop("value")).toMatchInlineSnapshot(`""`);
    });
    test("With reference value", () => {
        // make sure we don't accidentally break this locally
        expect(exampleData.relativeUrl).toBeDefined();
        const onClickReference = jest.fn();
        const wrapper = shallow(
            <Cell
                onChangeValue={noop}
                onResetValue={noop}
                onCreateComment={f => new CellComment()}
                onClickReference={onClickReference}
                column={exampleColumn}
                data={{...exampleData, value: "Some Noun"}}
                schema={{...exampleSchema, dataType: "__REFERENCE"}}/>);
        const children = wrapper
            .find(CellTextInput)
            .prop("children") as ReactNodeLike[];
        expect(children).toMatchInlineSnapshot(`
            Array [
              null,
              <div
                className="referenceLink"
                onClick={[Function]}
                onKeyDown={[Function]}
                tabIndex={0}
              >
                Some Noun
              </div>,
            ]
        `);
        wrapper.find(".referenceLink").simulate("click");
        expect(onClickReference).toHaveBeenCalledWith(exampleData.relativeUrl);
    });
});
