// Copyright 2018 Quip

import functions from "./functions.js";
import Styles from "./ExpressionPalette.less";

class Group extends React.Component {
    static propTypes = {
        group: React.PropTypes.object.isRequired,
        onInsertExpression: React.PropTypes.func.isRequired,
    }

    render() {
        const {group, onInsertExpression} = this.props;
        return <ul className={Styles.group}>
            {group.expressions.map((expression, i) => <Expression
                key={i}
                expression={expression.expression}
                width={group.gridSize}
                height={group.gridSize}
                onInsertExpression={onInsertExpression}/>)}
        </ul>;
    }
}

class Expression extends React.Component {
    static propTypes = {
        expression: React.PropTypes.string.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        onInsertExpression: React.PropTypes.func.isRequired,
    }

    render() {
        const {expression, onInsertExpression} = this.props;
        let html;
        try {
            html = katex.renderToString(expression);
        } catch (err) {
            console.error("Error rendering " + expression + ": " + err.message);
            return null;
        }
        return <li
            title={expression}
            className={"no-caret-move " + Styles.expression}
            dangerouslySetInnerHTML={{__html: html}}
            onClick={e => onInsertExpression(expression)}
            draggable={true}
            onDragStart={e => {
                e.dataTransfer.setData(
                    "text/plain",
                    // Strip out newlines since contentEditable will turn them
                    // into <div>s which cause editor DOM fsck failures.
                    expression.replace(/\n/g, " "));
            }}
            style={{
                width: this.props.width,
                height: this.props.height,
            }}/>;
    }
}

export default class ExpressionPalette extends React.Component {
    static propTypes = {
        onInsertExpression: React.PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)
        this.state = {selectedGroupIndex: 4};
    }

    render() {
        const {onInsertExpression} = this.props;
        const {selectedGroupIndex} = this.state;
        return <div className={Styles.palette}>
            <div className={Styles.header}>
                <select
                        value={selectedGroupIndex}
                        onChange={e => this.onSelectedGroupChange_(e)}>
                    {functions.groups.map((group, i) =>
                        <option key={i} value={i}>
                            {group.label}
                        </option>)}
                </select>
            </div>
            <Group
                group={functions.groups[selectedGroupIndex]}
                onInsertExpression={onInsertExpression}/>
        </div>;
    }

    onSelectedGroupChange_(e) {
        this.setState({selectedGroupIndex: parseInt(e.target.value, 10)});
    }
}
