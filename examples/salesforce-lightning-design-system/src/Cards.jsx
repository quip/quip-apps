import React from "react";
import {
    Button,
    Card,
    CardEmpty,
    CardFilter,
    DataTable,
    DataTableColumn,
    Icon,
} from "@salesforce/design-system-react";

const sampleItems = [
    {name: "Cloudhub"},
    {name: "Cloudhub + Anypoint Connectors"},
    {name: "Cloud City"},
];

export default class Example extends React.Component {
    constructor(props) {
        super();
        this.state = {
            items: sampleItems,
            isFiltering: false,
        };
    }

    handleFilterChange = event => {
        const filteredItems = sampleItems.filter(item =>
            RegExp(event.target.value, "i").test(item.name)
        );
        this.setState({isFiltering: true, items: filteredItems});
    };

    handleDeleteAllItems = () => {
        this.setState({isFiltering: false, items: []});
    };

    handleAddItem = () => {
        this.setState({items: sampleItems});
    };

    render() {
        const isEmpty = this.state.items.length === 0;

        return (
            <div className="slds-grid slds-grid--vertical">
                <Card
                    id="ExampleCard"
                    filter={
                        (!isEmpty || this.state.isFiltering) && (
                            <CardFilter onChange={this.handleFilterChange} />
                        )
                    }
                    headerActions={
                        !isEmpty && (
                            <Button
                                label="Delete All Items"
                                onClick={this.handleDeleteAllItems}
                            />
                        )
                    }
                    heading="Releated Items"
                    icon={
                        <Icon
                            category="standard"
                            name="document"
                            size="small"
                        />
                    }
                    empty={
                        isEmpty ? (
                            <CardEmpty heading="No Related Items">
                                <Button
                                    label="Add Item"
                                    onClick={this.handleAddItem}
                                />
                            </CardEmpty>
                        ) : null
                    }>
                    <DataTable
                        items={this.state.items}
                        id="DataTableExample-1"
                        bordered>
                        <DataTableColumn
                            label="Opportunity Name"
                            property="name"
                            truncate
                        />
                    </DataTable>
                </Card>
            </div>
        );
    }
}
