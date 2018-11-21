// Copyright 2017 Quip

import {Motion} from "react-motion";
import cx from "classnames";
import AddCardIcon from "./icons/add-card.jsx";
import {kHorizontalMargin} from "./card.jsx";
import {ColumnRecord} from "./model.jsx";
import {animateTo, focusCard} from "./root.jsx";

import styles from "./add-card.less";

export const kAddCardHeight = 34;

export default class AddCard extends React.Component {
    static propTypes = {
        columnRecord: React.PropTypes.instanceOf(ColumnRecord).isRequired,
        top: React.PropTypes.number.isRequired,
        left: React.PropTypes.number.isRequired,
        columnWidth: React.PropTypes.number.isRequired,
        columnSelected: React.PropTypes.bool.isRequired,
        columnDragging: React.PropTypes.bool.isRequired,
        cardDragging: React.PropTypes.bool.isRequired,
        hidden: React.PropTypes.bool.isRequired,
        isDraggingSomething: React.PropTypes.bool.isRequired,
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
