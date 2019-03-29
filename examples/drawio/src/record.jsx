/**
 * Copyright (c) 2018, JGraph Ltd
 * Copyright (c) 2018, Gaudenz Alder
 */
export class DiagramRoot extends quip.apps.RootRecord
{
    static getProperties()
    {
        return {
            config: "string",
            storage: "string",
//            comments: quip.apps.RecordList.Type(CommentEntity),
            revisions: quip.apps.RecordList.Type(DataEntity),
            edits: quip.apps.RecordList.Type(DataEntity),
            snapshot: "string",
            data: "string"
        };
    }
    
    static getDefaultProperties()
    {
        return{
            edits: [],
            comments: [],
            revisions: []
        };
    }
}

quip.apps.registerClass(DiagramRoot, "root");

export class DataEntity extends quip.apps.Record
{
    static getProperties()
    {
        return {
            data: "string"
        };
    }
}

quip.apps.registerClass(DataEntity, "DataEntity");

//export class CommentEntity extends quip.apps.Record
//{
//    static getProperties()
//    {
//        return {
//            pageId: "string",
//            cellId: "string"
//        };
//    }
//
//    getDom()
//    {
//        //var state = graph.view.getState(graph.model.getCell(this.get("cellId")));
//
//        //return (state != null && state.shape != null) ? ReactDOM.findDOMNode(state.shape.node) : null;
//        //return document.getElementById('graph'); //ReactDOM.findDOMNode(document.getElementById('graph'));
//        
//        console.log('getDom', ReactDOM.findDOMNode(document.getElementById('graph')));
//        
//        return ReactDOM.findDOMNode(document.getElementById('graph'));
//    }
//    
//    supportsComments()
//    {
//        return true;
//    }
//}
//
//quip.apps.registerClass(CommentEntity, "CommentEntity");
