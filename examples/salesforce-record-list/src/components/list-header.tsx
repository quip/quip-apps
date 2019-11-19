// Copyright 2019 Quip

import React, {Component, MouseEvent} from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import _ from "quiptext";
import Icon from "./icon";
import ErrorPopover from "../../shared/base-field-builder/error-popover.jsx";
import WarningIcon from "../../shared/base-field-builder/icons/warning.jsx";
import Styles from "./list.less";

interface ListHeaderProps extends InferProps<typeof ListHeader.propTypes> {
    onMouseEnterError: (e: MouseEvent<Element>) => void;
    onMouseLeaveError: (e: MouseEvent<Element>) => void;
    themeInfo: {name: string};
}

export default class ListHeader extends Component<ListHeaderProps> {
    static propTypes = {
        title: PropTypes.string.isRequired,
        link: PropTypes.string,
        children: PropTypes.node,
        themeInfo: PropTypes.object.isRequired,
        error: PropTypes.instanceOf(Error),
        isSaving: PropTypes.bool,
        isRefreshing: PropTypes.bool,
        showErrorPopover: PropTypes.bool,
        onMouseEnterError: PropTypes.func,
        onMouseLeaveError: PropTypes.func,
    };

    renderError_() {
        const {
            showErrorPopover,
            error,
            onMouseEnterError,
            onMouseLeaveError,
        } = this.props;
        return <div
            className={Styles.warning}
            onMouseEnter={onMouseEnterError}
            onMouseLeave={onMouseLeaveError}>
            <div className={Styles.warningText}>{_("Error")}</div>
            <WarningIcon/>
            {showErrorPopover ? (
                <ErrorPopover errorMessage={error.message}/>
            ) : null}
        </div>;
    }

    render() {
        const {
            title,
            link,
            themeInfo,
            error,
            isSaving,
            isRefreshing,
            children,
        } = this.props;
        let titleEl = <h2 className={Styles.name}>{title}</h2>;
        if (link) {
            titleEl = <a
                className={Styles.nameLink}
                href={link}
                target="_blank"
                rel="noopener noreferrer">
                {titleEl}
            </a>;
        }
        return <div className={Styles.header}>
            <div className={Styles.titleContainer}>
                {titleEl}
                <Icon object={themeInfo.name} type="standard" size="small">
                    {themeInfo.name}
                </Icon>
                {isSaving || isRefreshing ? (
                    <div className={Styles.saveSpinner}>
                        <quip.apps.ui.Spinner size={18}/>
                    </div>
                ) : null}
            </div>
            <div className={Styles.headerRightContent}>
                {error ? this.renderError_() : null}
                {children}
            </div>
        </div>;
    }
}
