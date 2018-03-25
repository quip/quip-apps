// Copyright 2018 Quip

import ExpressionPalette from "./ExpressionPalette.jsx";
import Styles from "./EquationInput.less";

export default class EquationInput extends React.PureComponent {
    static propTypes = {
        equationRecord: React.PropTypes.instanceOf(
            quip.apps.RichTextRecord).isRequired,
        appFocused: React.PropTypes.bool.isRequired,
    }

    render() {
        const {equationRecord, appFocused} = this.props;
        const classNames = [Styles.input];
        if (appFocused) {
            classNames.push(Styles.appFocused);
        }

        return <div className={classNames.join(" ")}>
            <div
                    className={Styles.editor}
                    ref={node => this.editorNode_ = node}
                    onMouseDown={e => this.onEditorMouseDown_(e)}>
                <quip.apps.ui.RichTextBox
                    ref={richTextBox => this.richTextBox_ = richTextBox}
                    record={equationRecord}
                    disableInlineMenus={true}
                    disableAutocomplete={true}
                    useDocumentTheme={true}
                    allowedStyles={[quip.apps.RichTextRecord.Style.TEXT_CODE]}
                    allowedInlineStyles={[]}
                    width="100%"/>
            </div>
            <div className={Styles.palette}>
                <ExpressionPalette
                    onInsertExpression={this.onInsertExpression_}/>
            </div>
        </div>;
    }

    focus() {
        this.props.equationRecord.focus();
    }

    onEditorMouseDown_(e) {
        // Make clicks in the visible editor area focus the rich text box
        // (even if it's not tall enough).
        if (e.target == this.editorNode_) {
            this.props.equationRecord.focus();
            e.preventDefault();
            e.stopPropagation();
        }
    }

    onInsertExpression_ = (expression) => {
        this.richTextBox_.insertText(expression);
    }
};
