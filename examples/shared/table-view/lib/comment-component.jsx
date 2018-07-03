// Copyright 2017 Quip

import cx from "classnames";
import styles from "../Card.less";
import {Card} from "../Card.less";

import {COLUMN_TYPE, COMMENT_TRIGGER_MAKEUP} from "../../table-view/model.js";
import {Y_BORDER} from "../../table-view/card.jsx";

const COMMENT_TRIGGER_HEIGHT = 13;

export class CommentToggle extends React.Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(quip.apps.Record).isRequired,
        showComments: React.PropTypes.bool.isRequired,
        rowHeight: React.PropTypes.number.isRequired,
        isFirstColumn: React.PropTypes.bool.isRequired,
        displayStyleFn: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            hasComments: this.props.record.getCommentCount() > 0,
        };
    }

    componentDidMount() {
        this.props.record.listenToComments(this.updateComments);
    }

    componentWillUnmount() {
        this.props.record.unlistenToComments(this.updateComments);
    }

    updateComments = () => {
        if (!quip.apps.isMobile()) {
            const hasComments = this.props.record.getCommentCount() > 0;
            if (hasComments != this.state.hasComments) {
                this.setState({hasComments: hasComments});
            }
        }
    };

    render() {
        const {isFirstColumn, rowHeight, record} = this.props;
        const showCommentIcon =
            this.props.showComments || this.state.hasComments;
        let displayStyle = {};
        if (this.props.displayStyleFn) {
            displayStyle = this.props.displayStyleFn(showCommentIcon);
        }
        const commentsTriggerStyle = Object.assign(
            {
                alignSelf: "flex-start",
                position: "relative",
                top: (rowHeight - Y_BORDER * 2 - COMMENT_TRIGGER_HEIGHT) / 2,
            },
            displayStyle);
        return <span
            style={commentsTriggerStyle}
            onClick={e => e.stopPropagation()}>
            <quip.apps.ui.CommentsTrigger
                className={cx(styles.commentsTrigger, {
                    [styles.firstColumnComment]: {isFirstColumn},
                })}
                record={record}
                showEmpty={true}/>
        </span>;
    }
}
