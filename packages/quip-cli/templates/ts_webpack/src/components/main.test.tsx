import {shallow, configure} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({adapter: new Adapter()});

import React from "react";
import {Menu} from "../menus";
import {RootEntity} from "../model/root";
import Main from "./main";

describe("Main Component", () => {
    let rootRecord: RootEntity;
    beforeEach(async () => {
        rootRecord = new RootEntity();
        rootRecord.initialize();
    });
    test("Main View", async () => {
        const menu = new Menu();
        const wrapper = shallow(
            <Main rootRecord={rootRecord} menu={menu} isCreation={true} />
        );
        expect(wrapper).toMatchInlineSnapshot(`
            <div
              className="root"
            >
              <div>
                <h1>
                  Hello, World!
                </h1>
                <p>
                  App Data:
                </p>
                <pre>
                  {"isHighlighted":false}
                </pre>
              </div>
            </div>
        `);
    });
});
