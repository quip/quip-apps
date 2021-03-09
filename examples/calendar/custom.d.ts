// Copyright 2020 Quip

declare module "*.svg" {
    const content: any;
    export default content;
}

declare module "*.less" {
    const styles: {[className: string]: string};
    export default styles;
}
