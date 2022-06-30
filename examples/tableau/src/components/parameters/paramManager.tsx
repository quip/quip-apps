import quip from "quip-apps-api";
import React, {ReactNode, useEffect, useState} from "react";
import {menuActions} from "../../menus";
import {Param, RootEntity} from "../../model/root";
import Dialog from "../dialog";
import RowItem from "../rowItem";
import AddParam from "./addParam";

interface ParamManagerProps {
    rootRecord: RootEntity;
}

const ParamManager = ({rootRecord}: ParamManagerProps) => {
    const [open, setOpen] = useState(false);
    const [newParam, setNewParam] = useState(false);
    const [editParam, setEditParam] = useState<string | undefined>();

    const setupMenuActions_ = () => {
        menuActions.openParameters = () => {
            setOpen(true);
        };
    };

    const closeParams = () => {
        setOpen(false);
    };

    const addNewParam = () => {
        setEditParam(undefined);
        setNewParam(true);
    };

    const closeNewParam = () => {
        setNewParam(false);
        setEditParam(undefined);
    };

    const editExistingParam = (id: string) => {
        setEditParam(id);
        setNewParam(true);
    };

    const updateParam = (id: string, newData: Param) => {
        rootRecord.setParam(id, newData.name, newData.active, newData.value);
    };

    const toggleParam = (id: string) => {
        const param = data.params.find((f) => f.id === id);
        if (param) {
            updateParam(param.id, {
                ...param,
                active: !param.active,
            });
        }
    };

    useEffect(() => {
        setupMenuActions_();
    }, []);

    const data = rootRecord.getData();

    let manager = <div></div>;
    if (open) {
        let addParam;
        if (newParam) {
            addParam = (
                <AddParam
                    rootRecord={rootRecord}
                    onClose={closeNewParam}
                    id={editParam}
                />
            );
        }

        let params: ReactNode = (
            <div className="empty-message">
                No parameters yet. Create one now!
            </div>
        );
        if (data.params.length > 0) {
            params = data.params.map((param) => (
                <RowItem
                    key={param.id}
                    title={param.name}
                    subtitle={param.value}
                    active={param.active}
                    onAction={() => editExistingParam(param.id)}
                    onToggle={() => toggleParam(param.id)}
                />
            ));
        }

        manager = (
            <Dialog title="Manage Parameters" onDismiss={closeParams}>
                <div className="body scroll">{params}</div>
                <div
                    className="footer"
                    style={{justifyContent: "space-between"}}>
                    <quip.apps.ui.Button
                        text="Add Parameter"
                        onClick={addNewParam}
                    />
                    <quip.apps.ui.Button
                        text="Done"
                        primary
                        onClick={closeParams}
                    />
                </div>
                {addParam}
            </Dialog>
        );
    }

    return manager;
};

export default ParamManager;
