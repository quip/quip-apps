// Copyright 2019 Quip

import React from "react";
import {shallow, mount} from "enzyme";
import quip from "quip-apps-api";
import {RootEntity} from "../model/root";
import {ListMenu} from "../menus";

import Main from "./main";

class TestAuth extends quip.apps.OAuth2 {}

describe("Main Component", () => {
    test("Logged Out View", () => {
        const rootRecord = new RootEntity();
        const listMenu = new ListMenu({});
        const wrapper = shallow(
            <Main
                rootRecord={rootRecord}
                listMenu={listMenu}
                isCreation={true}/>);
        expect(wrapper.find(".loginContext")).toHaveLength(1);
        expect(wrapper.find(".loginContext")).toMatchSnapshot();
        expect(wrapper.find(".openPicker")).toHaveLength(1);
        expect(wrapper.find(".openPicker")).toMatchInlineSnapshot(`
            <div
              className="openPicker"
            >
              <Button
                disabled={false}
                text="Connect to Salesforce"
              />
            </div>
        `);
    });

    test("Empty List", () => {
        const rootRecord = new RootEntity();
        const listMenu = new ListMenu({});
        const getData_ = rootRecord.getData;
        rootRecord.getData = jest.fn().mockImplementation(function(...args) {
            const data = getData_.call(this, ...args);
            data.selectedList.rows = [];
            data.selectedList.isEmpty = true;
            return data;
        });
        const wrapper = mount(
            <Main
                rootRecord={rootRecord}
                listMenu={listMenu}
                isCreation={true}/>);
        expect(wrapper.find(".emptyMessage")).toHaveLength(1);
        expect(wrapper.find(".emptyMessage")).toMatchInlineSnapshot(`
            <div
              className="emptyMessage"
            >
              <h2>
                No Records Found
              </h2>
            </div>
        `);
    });

    test("creationUrl triggers selectList with the correct args", () => {
        const rootRecord = new RootEntity();
        const listMenu = new ListMenu({});
        const creationUrl =
            "https://gus.lightning.force.com/lightning/o/ADM_Work__c/list?filterName=00BB0000000LaOaMAK";
        const instance = <Main
            rootRecord={rootRecord}
            listMenu={listMenu}
            isCreation={true}
            creationUrl={creationUrl}/>;

        const willMount = Main.prototype.componentDidMount;
        let spy;
        jest.spyOn(Main.prototype, "componentDidMount").mockImplementationOnce(
            function() {
                spy = jest.spyOn(this, "onSelectList_");
                willMount.apply(this, arguments);
            });
        shallow(instance);
        expect(spy).toBeDefined();
        expect(spy).toHaveBeenCalledWith("00BB0000000LaOaMAK", "ADM_Work__c");
    });

    test("initOptions triggers selectList with the correct args", () => {
        const rootRecord = new RootEntity();
        rootRecord.setAuth(new TestAuth());
        const listMenu = new ListMenu({});
        const instance = <Main
            rootRecord={rootRecord}
            listMenu={listMenu}
            isCreation={false}
            initOptionsJson={
                '{"list_id": "00BB0000000LaOaMAK", "object_type": "ADM_Work__c"}'
            }/>;

        const willMount = Main.prototype.componentDidMount;
        let spy;
        jest.spyOn(Main.prototype, "componentDidMount").mockImplementationOnce(
            function() {
                spy = jest.spyOn(this, "onSelectList_");
                willMount.apply(this, arguments);
            });
        shallow(instance);
        expect(spy).toBeDefined();
        expect(spy).toHaveBeenCalledWith("00BB0000000LaOaMAK", "ADM_Work__c");
    });
});
