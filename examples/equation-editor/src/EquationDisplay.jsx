// Copyright 2018 Quip

import Styles from "./EquationDisplay.less";

export default class EquationDisplay extends React.PureComponent {

    static propTypes = {
        equation: React.PropTypes.string.isRequired,
        appFocused: React.PropTypes.bool.isRequired,
        size: React.PropTypes.oneOf(["small", "medium", "large"]),
        align: React.PropTypes.oneOf(["left", "center", "right"]),
        onEdit: React.PropTypes.func.isRequired,
    }

    render() {
        const {html, error} = this.getEquationHtml_();
        let output;
        if (error) {
            output = <div className={Styles.error}>
                <h2>Rendering Error</h2>
                {error.message}
            </div>;
        } else {
            const {appFocused, size, align, onEdit} = this.props;
            const SIZE_CLASS_MAP = new Map([
                ["small", Styles.sizeSmall],
                ["medium", Styles.sizeMedium],
                ["large", Styles.sizeLarge],
            ]);
            const ALIGN_CLASS_MAP = new Map([
                ["left", Styles.alignLeft],
                ["center", Styles.alignCenter],
                ["right", Styles.alignRight],
            ]);
            const classNames = [
                Styles.output,
                SIZE_CLASS_MAP.get(size),
                ALIGN_CLASS_MAP.get(align),
            ];
            if (appFocused) {
                classNames.push(Styles.appFocused);
            }
            output = <div className={classNames.join(" ")}>
                <span dangerouslySetInnerHTML={{__html: html}}/>
                <EditButton onClick={onEdit}/>
            </div>;
        }
        return <div>{output}</div>;
    }

    getEquationHtml_() {
        const {equation} = this.props;
        let html;
        let error;
        try {
            html = katex.renderToString(equation);
        } catch (err) {
            error = err;
        }
        return {html, error};
    }
}

const EditButton = ({onClick}) =>
    <div className={`${Styles.editButton} clickable`} onClick={onClick}>
        <svg viewBox="4 -2 16 16">
            <path d="M16.75,3.25l-2-2L16,0h0.956L18,1.043V2ZM6,11.995L7,9l7.25-7.25,2,2L9,11Z"/>
        </svg>
</div>;
