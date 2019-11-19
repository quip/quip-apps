// Copyright 2019 Quip

import React, {Component} from "react";
import PropTypes, {InferProps} from "prop-types";
import _ from "quiptext";
import classNames from "classnames";
import Styles from "./paginator.less";
import Icon from "./icon";

interface PaginatorProps extends InferProps<typeof Paginator.propTypes> {
    onGoBack: () => void;
    onGoForward: () => void;
}

export default class Paginator extends Component<PaginatorProps> {
    static propTypes = {
        startIndex: PropTypes.number.isRequired,
        endIndex: PropTypes.number.isRequired,
        totalCount: PropTypes.number.isRequired,
        onGoBack: PropTypes.func.isRequired,
        onGoForward: PropTypes.func.isRequired,
    };

    render() {
        const {
            startIndex,
            endIndex,
            totalCount,
            onGoBack,
            onGoForward,
        } = this.props;
        const canPaginate = startIndex > 0 || endIndex !== totalCount;
        return <div className={Styles.paginator}>
            <span className={Styles.pageInfo}>
                {_("%(startIndex)s-%(endIndex)s of %(totalCount)s", {
                    startIndex: startIndex + 1,
                    endIndex,
                    totalCount,
                })}
            </span>
            {canPaginate ? (
                <div className={Styles.buttonGroup}>
                    <div
                        className={classNames(Styles.button, {
                            [Styles.disabled]: startIndex === 0,
                        })}
                        onClick={onGoBack}>
                        <Icon
                            object="chevronleft"
                            type="utility"
                            size="x-small"/>
                    </div>
                    <div
                        className={classNames(Styles.button, {
                            [Styles.disabled]: endIndex >= totalCount,
                        })}
                        onClick={onGoForward}>
                        <Icon
                            object="chevronright"
                            type="utility"
                            size="x-small"/>
                    </div>
                </div>
            ) : null}
        </div>;
    }
}
