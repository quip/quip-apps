// Copyright 2019 Quip

import React, {Component} from "react";
import PropTypes, {InferProps} from "prop-types";
import classNames from "classnames";
import {Icon as SLDSIcon} from "@salesforce/design-system-react";
import Styles from "./icon.less";

/**
 * @fileoverview Renders a SLDS icon SVG. See docs for a list of valid values:
 * https://lightningdesignsystem.com/icons/
 */
interface IconProps extends InferProps<typeof Icon.propTypes> {
    type: "action" | "custom" | "doctype" | "standard" | "utility";
    colorVariant?: "base" | "default" | "error" | "light" | "warning";
    size: "xx-small" | "x-small" | "small" | "medium" | "large";
}

export default class Icon extends Component<IconProps> {
    static propTypes = {
        className: PropTypes.arrayOf(PropTypes.string),
        sortable: PropTypes.bool,
        editable: PropTypes.bool,
        colorVariant: PropTypes.string,
        rightInputIcon: PropTypes.bool,
        type: PropTypes.string.isRequired,
        object: PropTypes.string.isRequired,
        size: PropTypes.string.isRequired,
        children: PropTypes.node,
    };

    static defaultProps = {
        sortable: false,
        editable: false,
        rightInputIcon: false,
    };

    render() {
        const {
            type,
            size,
            className,
            colorVariant,
            children,
            sortable,
            editable,
            rightInputIcon,
        } = this.props;
        let object = this.props.object.toLowerCase();

        const isUtility = type === "utility";

        const classes = classNames(
            Styles.sldsIcon,
            "slds-icon",
            `slds-icon_${size}`,
            {
                "slds-is-sortable__icon": isUtility && sortable,
                "slds-button__icon_edit": isUtility && editable,
                "slds-input__icon slds-input__icon_right":
                    isUtility && rightInputIcon,
                "slds-icon-text-default": isUtility,
            });

        return <div
            className={classNames(
                Styles.icon,
                `slds-icon-${type}-${object}`,
                className)}>
            <SLDSIcon
                colorVariant={colorVariant}
                className={classes}
                category={type}
                name={object}/>
            {children}
        </div>;
    }
}
