import Styles from "./Checkmark.less";

const Checkmark = ({checked, onClick}) => (
    <div
        className={Styles.inputCheckContainer}
        onClick={onClick}
        style={{
            backgroundColor: checked ? "#29b6f2" : null,
        }}>
        <svg
            className={Styles.checkmark}
            width="18"
            height="18"
            viewBox="0 0 18 18">
            <path d="M7.181,15.007a1,1,0,0,1-.793-0.391L3.222,10.5A1,1,0,1,1,4.808,9.274L7.132,12.3l6.044-8.86A1,1,0,1,1,14.83,4.569l-6.823,10a1,1,0,0,1-.8.437H7.181Z" />
        </svg>
    </div>
);

Checkmark.propTypes = {
    checked: React.PropTypes.bool,
};

export default Checkmark;
