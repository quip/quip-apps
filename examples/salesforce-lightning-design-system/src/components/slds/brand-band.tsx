import React, {FunctionComponent} from "react";
import SLDSBrandBand from "@salesforce/design-system-react/components/brand-band";

export const BrandBand: FunctionComponent = () => <SLDSBrandBand
    id="brand-band-lightning-blue"
    className="slds-p-around_small"
    theme="lightning-blue">
    <div className="slds-box slds-theme_default">
        <h3 className="slds-text-heading_label slds-truncate">
            Brand Band Example
        </h3>
    </div>
</SLDSBrandBand>;
