// Copyright 2019 Quip

import React from "react";
import {mount} from "enzyme";

import Icon from "./icon";

describe("Icon component", () => {
    test("utility", () => {
        const allOn = mount(
            <Icon
                type="utility"
                object="edit"
                size="x-small"
                editable={true}
                sortable={true}
                rightInputIcon={true}/>);
        expect(allOn).toMatchSnapshot();
        const allOff = mount(
            <Icon
                type="utility"
                object="edit"
                size="x-small"
                editable={false}
                sortable={false}
                rightInputIcon={false}/>);
        expect(allOff).toMatchSnapshot();
    });
    test("standard", () => {
        const wrapper = mount(
            <Icon type="standard" object="agent_session" size="x-small"/>);
        expect(wrapper).toMatchSnapshot();
    });
    test("action", () => {
        const wrapper = mount(
            <Icon type="action" object="goal" size="x-small"/>);
        expect(wrapper).toMatchSnapshot();
    });
});
