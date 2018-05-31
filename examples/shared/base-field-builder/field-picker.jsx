// Copyright 2017 Quip

import CheckmarkIcon from "./icons/checkmark.jsx";
import RecordEntity from "./model/record.js";
import Styles from "./field-picker.less";
import RowContainer from "./row-container.jsx";
import {entityListener, sortBy} from "./utils.jsx";

class FieldPicker extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordEntity).isRequired,
        onSelectField: React.PropTypes.func,
        query: React.PropTypes.string.isRequired,
        fromTop: React.PropTypes.bool,
        downwardsOffset: React.PropTypes.number,
        upwardsOffset: React.PropTypes.number,
        className: React.PropTypes.string,
    };

    static defaultProps = {
        downwardsOffset: 0,
        upwardsOffset: 0,
    };

    componentDidMount() {
        if (quip.apps.startDisplayingAboveMenus) {
            quip.apps.startDisplayingAboveMenus();
        }
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
        quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this));
        if (quip.apps.stopDisplayingAboveMenus) {
            quip.apps.stopDisplayingAboveMenus();
        }
    }

    onClick_ = e => {
        e.stopPropagation();
    };

    renderRow_ = (field, isHighlighted) => {
        const classNames = [Styles.row];
        if (isHighlighted) {
            classNames.push(Styles.highlighted);
        }
        return <div
            className={classNames.join(" ")}
            key={field.key}
            onClick={e => this.props.onSelectField(e, field)}>
            <div className={Styles.label}>{field.label}</div>
        </div>;
    };

    render() {
        const bottomOffset = 80;
        const popoverHeight = 200;
        const viewportDimensions = quip.apps.getViewportDimensions();
        const boundingRect = quip.apps.getBoundingClientRect();
        const style = {height: popoverHeight};
        const start = this.props.fromTop
            ? boundingRect.top
            : boundingRect.bottom;
        if (start + popoverHeight + bottomOffset > viewportDimensions.height) {
            style.top = -popoverHeight + this.props.upwardsOffset;
        } else {
            style.top = this.props.downwardsOffset;
        }
        const addedFieldKeys = new Set(
            this.props.entity.getFields().map(entity => entity.getKey()));
        const fields = this.props.entity.supportedFieldsDataArray();
        sortBy(fields, field => field.label);
        const resultFields = fields.filter(field => {
            return (
                !addedFieldKeys.has(field.key) &&
                field.label
                    .toLowerCase()
                    .includes(this.props.query.toLowerCase())
            );
        });
        const classNames = [Styles.popover];
        if (this.props.className) {
            classNames.push(this.props.className);
        }
        return <div
            className={classNames.join(" ")}
            style={style}
            onClick={this.onClick_}>
            <RowContainer
                containerClassName={Styles.result}
                rows={resultFields}
                renderRow={this.renderRow_}
                selectOnHover={true}
                onSubmitSelectedRow={this.props.onSelectField}
                isActive={true}
                defaultSelectedRowIndex={0}/>
        </div>;
    }
}

export default entityListener(FieldPicker);
