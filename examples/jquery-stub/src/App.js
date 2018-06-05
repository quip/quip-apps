import $ from "jquery"
import Styles from "./App.less";

function renderBadge(rootNode) {
    var header = $("<div/>")
        .addClass(Styles.header)
        .append($("<div/>").text("Hello").addClass(Styles.hello))
        .append($("<div/>").text("your name is").addClass(Styles.nameLabel));
    var firstName = $("<div/>")
        .addClass(Styles.firstName)
        .text(quip.apps.getViewingUser().getFirstName());
    var footer = $("<div/>").addClass(Styles.footer);
    var badge = $("<div/>")
        .addClass(Styles.badge)
        .css("background-color", quip.apps.ui.ColorMap.RED.VALUE)
        .append(header)
        .append(firstName)
        .append(footer);
    $(rootNode).html(badge);
}

export const start = function(rootNode) {
    renderBadge(rootNode);
};
