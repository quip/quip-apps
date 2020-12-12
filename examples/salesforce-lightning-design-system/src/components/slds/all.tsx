import React, {FunctionComponent, ReactElement} from "react";
import {BrandBand} from "./brand-band";
import {ButtonGroups} from "./button-groups";
import {Icons} from "./icons";

export const AllSLDSComponents: FunctionComponent = () => <ul>
    {([
        ["Icons", <Icons/>],
        ["Button Groups", <ButtonGroups/>],
        ["Brand Band", <BrandBand/>],
    ] as [string, ReactElement][]).map(([title, component]) => <li key={title}>
        <h2>{title}</h2>
        {component}
    </li>)}
</ul>;
