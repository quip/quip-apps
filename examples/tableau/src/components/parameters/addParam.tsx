import quip from "quip-apps-api";
import React, {useEffect, useState} from "react";
import Dialog from "../dialog";
import {v4 as uuid} from "uuid";
import {RootEntity} from "../../model/root";

interface AddParamProps {
    rootRecord: RootEntity;
    onClose: () => void;
    id?: string;
}

const AddParam = ({rootRecord, onClose, id}: AddParamProps) => {
    const [paramName, setParamName] = useState("");
    const [paramValue, setParamValue] = useState("");

    useEffect(() => {
        if (id) {
            const data = rootRecord.getData();
            const param = data.params.find((f) => f.id === id);
            if (param) {
                setParamName(param.name);
                setParamValue(param.value);
            }
        }
    }, [id]);

    const isValid = () => {
        if (!paramName || paramName.trim().length === 0) return false;
        if (paramValue.trim().length === 0) return false;

        return true;
    };

    const addParam = () => {
        const newId = id ?? uuid();
        let active = true;
        if (id) {
            const record = rootRecord.getData().params.find((p) => p.id === id);
            if (record) {
                active = record.active;
            }
        }
        rootRecord.setParam(newId, paramName, active, paramValue);
        onClose();
    };

    const deleteParam = () => {
        if (id) {
            rootRecord.deleteParam(id);
        }
        onClose();
    };

    return (
        <Dialog title="Add Parameter" onDismiss={onClose} noBackdrop>
            <div className="body">
                <div className="margin-s input-box">
                    <label htmlFor="param-name">Parameter Name</label>
                    <input
                        id="param-name"
                        type="text"
                        placeholder="Parameter Name"
                        value={paramName}
                        onChange={(e) => setParamName(e.currentTarget.value)}
                    />
                </div>
                <div className="margin-s input-box">
                    <label htmlFor="param-value">Value</label>
                    <input
                        id="param-value"
                        type="text"
                        placeholder="Enter Value"
                        value={paramValue}
                        onChange={(e) => setParamValue(e.currentTarget.value)}
                    />
                </div>
            </div>
            <div
                className="footer"
                style={{justifyContent: id ? "space-between" : "flex-end"}}>
                {id ? (
                    <quip.apps.ui.Button
                        text="Delete Parameter"
                        className="destructive"
                        onClick={deleteParam}
                    />
                ) : undefined}
                <div>
                    <quip.apps.ui.Button text="Cancel" onClick={onClose} />
                    <quip.apps.ui.Button
                        text="Done"
                        primary
                        onClick={addParam}
                        disabled={!isValid()}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default AddParam;
