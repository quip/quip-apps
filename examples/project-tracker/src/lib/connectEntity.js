// TODO: replace isV2 parameter with record.getDataVersion() === 2 once that works
export default (
    record,
    WrappedComponent,
    {isV2 = false, mapStateToProps = () => {}} = {}) => {
    class RecordComponent extends React.Component {
        constructor(props) {
            super(props);

            this.state = Object.assign(
                {},
                record.getData(),
                !isV2 && {childEntities: record.getChildren()});
        }

        componentDidMount() {
            this._recordListener = record.listen(() =>
                this.setState(record.getData())
            );

            if (!isV2) {
                this._childrenListener = record
                    .getChildrenIndex()
                    .listen(() =>
                        this.setState({childEntities: record.getChildren()})
                    );
            }
        }

        componentWillUnmount() {
            if (this._recordListener) {
                record.unlisten(this._recordListener);
            }

            if (this._childrenListener) {
                record.getChildrenIndex().unlisten(this._childrenListener);
            }
        }

        render() {
            return <WrappedComponent
                {...this.props}
                {...this.state}
                {...mapStateToProps(this.state)}
                {...{[isV2 ? "record" : "entity"]: record}}/>;
        }
    }

    return RecordComponent;
};
