// Copyright 2017 Quip

import PropTypes from "prop-types";
import {Motion} from "react-motion";
import cx from "classnames";
import AddCardIcon from "./icons/add-card.jsx";
import {kHorizontalMargin} from "./card.jsx";
import {ColumnRecord} from "./model.tsx";
import {animateTo, focusCard} from "./root.tsx";

import styles from "./add-card.less";

export const kAddCardHeight = 34;

export default class AddCard extends React.Component {
    static propTypes = {
        columnRecord: PropTypes.instanceOf(ColumnRecord).isRequired,
        top: PropTypes.number.isRequired,
        left: PropTypes.number.isRequired,
        columnWidth: PropTypes.number.isRequired,
        columnSelected: PropTypes.bool.isRequired,
        columnDragging: PropTypes.bool.isRequired,
        cardDragging: PropTypes.bool.isRequired,
        hidden: PropTypes.bool.isRequired,
        isDraggingSomething: PropTypes.bool.isRequired,
    };

    render() {
        const classNames = cx(styles.addCard, {
            [styles.columnSelected]: this.props.columnSelected,
            [styles.hidden]: this.props.hidden,
        });

        const shouldNotAnimate =
            (this.props.columnDragging && !this.props.cardDragging) ||
            !this.props.isDraggingSomething;
        const shouldAnimate = this.props.cardDragging;
        const motionStyle = {
            translateX: shouldNotAnimate
                ? this.props.left
                : animateTo(this.props.left),
            translateY: shouldAnimate
                ? animateTo(this.props.top)
                : this.props.top,
            zIndex: this.props.columnDragging ? 99 : animateTo(1),
        };

        return <Motion style={motionStyle}>
            {({translateX, translateY, zIndex}) => {
                const elementStyle = {
                    width: this.props.columnWidth - kHorizontalMargin * 2,
                    height: kAddCardHeight,
                    // Yosemite fix
                    WebkitTransform: `translate3d(${translateX}px,
                            ${translateY}px, 0)`,
                    transform: `translate3d(${translateX}px,
                        ${translateY}px, 0)`,
                    zIndex: zIndex,
                };

                return <div
                    className={classNames}
                    style={elementStyle}
                    onClick={this.onClick_}>
                    <AddCardIcon/>
                </div>;
            }}
        </Motion>;
    }

    onClick_ = e => {
        e.stopPropagation();
        focusCard(this.props.columnRecord.addCard(false));
    };
}
