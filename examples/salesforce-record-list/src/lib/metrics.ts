// Copyright 2019 Quip

import quip from "quip-apps-api";

export default function recordMetric(
    name: string,
    params: {[name: string]: string} = {}) {
    const extra: {[name: string]: string} = {};
    for (const param in params) {
        if (typeof params[param] !== "string") {
            console.error(
                `non-string metrics parameter ${param} provided to ${name}: ${
                    params[param]
                }.`);
        }
        // coerce all params to strings so they can't throw in recordQuipMetric
        extra[param] = params[param] + "";
    }
    return quip.apps.recordQuipMetric(`sf_record_list_${name}`, extra);
}
