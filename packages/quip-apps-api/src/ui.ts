// Copyright 2019 Quip

import React, {Component} from "react";

// TODO: handle children in this file correctly (if they differ from current
// handling) so that trees will be snapshottable

export class Button extends Component {
    render() {
        return React.createElement("div", null, "ui.Button");
    }
}

export class CalendarPicker extends Component {
    render() {
        return React.createElement("div", null, "ui.CalendarPicker");
    }
}

export class Canvas extends Component {
    render() {
        return React.createElement("div", null, "ui.Canvas");
    }
}

export class Color extends Component {
    render() {
        return React.createElement("div", null, "ui.Color");
    }
}

export class ColorMap extends Component {
    render() {
        return React.createElement("div", null, "ui.ColorMap");
    }
}

export class CommentsTrigger extends Component {
    render() {
        return React.createElement("div", null, "ui.CommentsTrigger");
    }
}

export class ProfilePicture extends Component {
    render() {
        return React.createElement("div", null, "ui.ProfilePicture");
    }
}

export class RichTextBox extends Component {
    render() {
        return React.createElement("div", null, "ui.RichTextBox");
    }
}

export class Spinner extends Component {
    render() {
        return React.createElement("div", null, "ui.Spinner");
    }
}
