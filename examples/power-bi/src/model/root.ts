import quip from "quip-apps-api";

export interface AppData {
    reportId?: string;
    reportLink?: string;
    reportUrl?: string;
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "powerbi";

    static getProperties() {
        return {
            reportId: "string",
            reportLink: "string",
            reportUrl: "string",
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        return {};
    }
    
    isTemplate = false;
    templateParams: { [key: string]: string } = {};

    getData(): AppData {
        return super.getData() as AppData;
    }

    setReport(id: string, url: string, link: string) {
        this.set("reportId", id);
        this.set("reportLink", link);
        this.set("reportUrl", url);
        this.notifyListeners();
    }

    async reloadTemplateParams() {
        const templateInfo = await quip.apps.getTemplateParams();
        this.templateParams = templateInfo.templateParams;
        this.isTemplate = templateInfo.isTemplate;
        this.notifyListeners();
    }

    toggleTemplateMode = () => {
        this.isTemplate = !this.isTemplate;
        quip.apps.updateTemplateParams(this.templateParams, this.isTemplate);
        this.notifyListeners();
    }

    isTemplateMode() {
        return this.isTemplate;
    }

    getTemplateParams() {
        return this.templateParams;
    }

    updateTemplateParam = (name: string, value: string) => {
        this.templateParams[name] = value;
        quip.apps.updateTemplateParams(this.templateParams, this.isTemplate);
    }
}
