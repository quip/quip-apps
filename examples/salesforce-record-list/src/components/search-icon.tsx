// Copyright 2019 Quip

import React, {StatelessComponent} from "react";
import Styles from "./list-picker.less";

const SearchIcon: StatelessComponent = () => <svg
    className={Styles.searchIcon}
    viewBox="0 0 18 18">
    <path
        className={Styles.svgPath}
        d="M15.7,15.7a1.008,1.008,0,0,1-1.426,0l-3.811-3.811a6.029,6.029,0,1,1,1.426-1.426L15.7,14.273A1.008,1.008,0,0,1,15.7,15.7ZM7,3a4,4,0,1,0,4,4A4,4,0,0,0,7,3Z"/>
</svg>;

export default SearchIcon;
