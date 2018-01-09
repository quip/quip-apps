import React from "react";
import styles from "./OwnerTooltip.less";

const { ProfilePicture } = quip.apps.ui;

const OwnerTooltip = ({ user, onMouseEnter, onMouseLeave }) => {
    return (
        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={styles.wrapper}>
            <ProfilePicture user={user} round size={30}/>
            <p>{user.getName()}</p>
        </div>
    );
};

OwnerTooltip.propTypes = {
    user: React.PropTypes.instanceOf(quip.apps.User),
    onMouseEnter: React.PropTypes.func.isRequired,
    onMouseLeave: React.PropTypes.func.isRequired,
};

export default OwnerTooltip;
