import {Button} from "@salesforce/design-system-react";

import logoSrc from "./assets/analytics-studio.png";
import Styles from "./ButtonPrompt.less";

const ButtonPrompt = ({onClick, text}) => <div
    className={Styles.loginContainer}
    onClick={onClick}>
    <img src={logoSrc} className={Styles.loginLogoBackground}/>
    <Button onClick={onClick}>{text}</Button>
</div>;

export default ButtonPrompt;
