const Plus = ({size = 18}) => <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 18 18">
    <path d="M9,3a1,1,0,0,1,1,1V14a1,1,0,0,1-2,0V4A1,1,0,0,1,9,3ZM4,8H14a1,1,0,0,1,0,2H4A1,1,0,0,1,4,8Z"/>
</svg>;

Plus.propTypes = {
    size: React.PropTypes.number,
};

export default Plus;
