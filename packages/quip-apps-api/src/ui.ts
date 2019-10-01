// Copyright 2019 Quip

const {Component} = require("react");

const ui = {};

class Button extends Component {
    render() {
        return React.createElement("div", null, "ui.Button");
    }
}
ui.Button = Button;

class CalendarPicker extends Component {
    render() {
        return React.createElement("div", null, "ui.CalendarPicker");
    }
}
ui.CalendarPicker = CalendarPicker;

class Canvas extends Component {
    render() {
        return React.createElement("div", null, "ui.Canvas");
    }
}
ui.Canvas = Canvas;

class Color extends Component {
    render() {
        return React.createElement("div", null, "ui.Color");
    }
}
ui.Color = Color;

class ColorMap extends Component {
    render() {
        return React.createElement("div", null, "ui.ColorMap");
    }
}
ui.ColorMap = ColorMap;

class CommentsTrigger extends Component {
    render() {
        return React.createElement("div", null, "ui.CommentsTrigger");
    }
}
ui.CommentsTrigger = CommentsTrigger;

class ProfilePicture extends Component {
    render() {
        return React.createElement("div", null, "ui.ProfilePicture");
    }
}
ui.ProfilePicture = ProfilePicture;

class RichTextBox extends Component {
    render() {
        return React.createElement("div", null, "ui.RichTextBox");
    }
}
ui.RichTextBox = RichTextBox;

class Spinner extends Component {
    render() {
        return React.createElement("div", null, "ui.Spinner");
    }
}
ui.Spinner = Spinner;

module.exports = ui;
