// Copyright 2019 Quip

declare module "*.svg" {
    const content: any;
    export default content;
}

declare module "*.less" {
    const styles: {[className: string]: string};
    export default styles;
}

declare module "@salesforce/design-system-react";
