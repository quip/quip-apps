import quip from "quip";

export class TodoListRecord extends quip.apps.Record {
  static getProperties = () => ({
    items: quip.apps.RecordList.Type(TodoListItemRecord)
  });

  static getDefaultProperties = () => ({
    items: []
  });
}
quip.apps.registerClass(TodoListRecord, "todo-list-record");

export class TodoListItemRecord extends quip.apps.Record {
  static getProperties = () => ({
    label: "string",
    completed: "boolean"
  });

  static getDefaultProperties = () => ({
    label: "",
    completed: false
  });
}
quip.apps.registerClass(TodoListItemRecord, "todo-list-item-record");

