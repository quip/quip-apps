const test = require("tape");
const React = require("react");
const TestRenderer = require("react-test-renderer");
const ui = require("../dist/ui");

const UI_NAMESPACE = [
    "Button",
    "CalendarPicker",
    "Canvas",
    "Color",
    "ColorMap",
    "CommentsTrigger",
    "ImageMode",
    "Image",
    "ProfilePicture",
    "RichTextBox",
    "Spinner",
    "Style",
].sort();

test("ui namespace exposes standard components", t => {
    t.plan(UI_NAMESPACE.length);
    const names = Object.keys(ui).sort();
    for (const idx in names) {
        t.equal(UI_NAMESPACE[idx], names[idx], `${UI_NAMESPACE[idx]} exists`);
    }
});

const UI_REACT_COMPONENTS = [
    ui.Button,
    ui.CalendarPicker,
    ui.Canvas,
    ui.CommentsTrigger,
    ui.Image,
    ui.ProfilePicture,
    ui.RichTextBox,
    ui.Spinner,
].sort();

test("ui react components are valid", t => {
    t.plan(UI_REACT_COMPONENTS.length);
    for (const Component of UI_REACT_COMPONENTS) {
        t.doesNotThrow(() => {
            TestRenderer.create(React.createElement(Component, {}, null));
        }, `${Component.name} is a React component`);
    }
});
