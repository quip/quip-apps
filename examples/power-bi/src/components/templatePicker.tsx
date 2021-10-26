import React, { ChangeEvent, useState } from "react";
import { RootEntity } from "../model/root";

interface TemplatePickerProps {
  record: RootEntity;
}

const TemplatePicker = ({ record }: TemplatePickerProps) => {

  const [reportId, setReportId] = useState(record.getTemplateParams()["reportId"] || "");

  const updateReportId = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget?.value ?? "";
    
    setReportId(newValue);
    record.updateTemplateParam("reportId", newValue);
  };

  return (
    <div className="dash-selector">
      <div className="title">Template Mode</div>
      <fieldset className="field">
        <label htmlFor="reportId">Report ID or URL</label>
        <input
          id="reportId"
          name="reportId"
          type="text"
          value={reportId}
          onChange={updateReportId}
        />
      </fieldset>
    </div>
  );
};

export default TemplatePicker;
