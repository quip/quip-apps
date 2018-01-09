// Copyright 2017 Quip

import Card from "../Card.less";
import {COMMENT_TRIGGER_MAKEUP} from "../model.js";

export class CommentToggle extends React.Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(quip.apps.Record).isRequired,
        showComments: React.PropTypes.bool.isRequired,
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
        const comments = this.props.showComments || this.state.hasComments;
        return this.props.children(comments);
    }
}

export class CommentVisibilityToggle extends React.Component {
    render() {
        return <CommentToggle
            record={this.props.record}
            showComments={this.props.showComments}>
            {comments => {
                if (comments) {
                    return this.props.children;
                } else {
                    return null;
                }
            }}
        </CommentToggle>;
    }
}

export const withCommentWidthToggle = Component => {
    return class extends React.Component {
        static propTypes = {
            record: React.PropTypes.instanceOf(quip.apps.Record).isRequired,
            showComments: React.PropTypes.bool.isRequired,
            textWidth: React.PropTypes.number.isRequired,
        };

        render() {
            return <CommentToggle
                record={this.props.record}
                showComments={this.props.showComments}>
                {comments => {
                    let width = comments
                        ? this.props.textWidth - COMMENT_TRIGGER_MAKEUP
                        : this.props.textWidth;
                    return <Component {...this.props} textWidth={width}/>;
                }}
            </CommentToggle>;
        }
    };
    return CommentToggle;
};
