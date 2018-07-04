import React from 'react';
import quip from 'quip';
import Dialog from './components/Dialog/Dialog';
import Styles from "./App.less";
import PriceChart from './components/PriceChart/PriceChart';
import Link from './components/Link/Link';

export default class App extends React.Component {

    state = {
        record: null,
        newSymbol: '',
        symbolError: null,
        pickerOpen: false,
        termsOpen: false
    }

    componentDidMount() {
        this.props.setApp(this);
        this.setState({ record: this.props.record });

        this.fetchData()
            .then(() => {
                return this.pollNext();
            });
    }

    fetchData() {
        return this.props.record.fetchData()
            .then(() => {
                this.setState({ record: this.props.record });
            })
            .catch(() => {
                this.props.record.set('error', true);
                this.setState({ record: this.props.record });
            });
    }

    pollNext(delay = 10000) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, delay);
        })
            .then(() => this.fetchData())
            .then(() => this.pollNext(delay))
            .catch(err => {
                console.log('Error', err);
            });
    }

    updateSymbolHandler = () => {
        this.props.record.updateSymbol(this.state.newSymbol)
            .then(() => {
                this.dismissPickerHandler();
            })
            .catch(err => {
                err.response.text().then(text => {
                    this.setState({ symbolError: text });
                });
            });
    }

    updateTimeframeHandler = (timeframe) => {
        this.props.record.updateTimeframe(timeframe)
            .then(() => {
                this.setState({ record: this.props.record });
            });
    }

    openPickerHandler = () => {
        this.setState({ pickerOpen: true });
    }

    openTermsHandler = () => {
        this.setState({ termsOpen: true });
    }

    dismissTermsHandler = () => {
        this.setState({ termsOpen: false });
    }

    dismissPickerHandler = () => {
        this.setState({
            pickerOpen: false,
            newSymbol: '',
            symbolError: null
        });
    }

    symbolChangedHandler = (event) => {
        this.setState({ newSymbol: event.target.value.toUpperCase() });
    }

    updateColor(color) {
        this.props.record.set("color", color);
        quip.apps.updateToolbar({
            highlightedCommandIds: [color]
        });
        this.setState({ record: this.props.record });
    }

    render() {
        const symbol = this.props.record.get('symbol');
        const timeframe = this.props.record.get('timeframe');
        const prices = this.props.record.get('prices');
        const companyName = this.props.record.get('company');
        const chartColor = this.props.record.get('color');
        const error = this.props.record.get('error');
        const lastRefreshed = this.props.record.get('lastRefreshed');

        let priceInfo;
        if (prices && prices.length > 0) {
            const latestPrice = prices[prices.length - 1];

            const pctChangeStyles = [Styles.pctChange];
            if (latestPrice.pctChange && latestPrice.pctChange > 0) {
                pctChangeStyles.push(Styles.pctChangePositive);
            } else if (latestPrice.pctChange && latestPrice.pctChange < 0) {
                pctChangeStyles.push(Styles.pctChangeNegative);
            }

            priceInfo = <div className={Styles.pricebox}>
                <div className={Styles.price}>{latestPrice.close ? latestPrice.close.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : null}</div>
                <div className={Styles.time}>
                    {latestPrice.pctChange
                        ? <span className={pctChangeStyles.join(' ')}>{(latestPrice.pctChange * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%'}<span> - </span></span>
                        : null }
                    {latestPrice.label}
                </div>
            </div>;
        }

        const timeframes = ['1d', '1m', '3m', '6m', '1y', '2y', '5y'];
        const timeframeSelectors = timeframes.map(t => <button key={t} className={timeframe === t ? Styles.active : null} onClick={() => this.updateTimeframeHandler(t)}>{t}</button>);

        let picker, terms;
        if (this.state.pickerOpen) {
            picker = <Dialog showBackdrop={true} onDismiss={this.dismissPickerHandler} >
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Change Asset")}
                    </div>
                    <div style={{ padding: '20px 20px 20px 20px' }} className={Styles.dialogContent}>
                        <div style={{ marginBottom: '5px' }}>Enter a new symbol:</div>
                        <input type="text" placeholder="e.g. CRM" value={this.state.newSymbol} onChange={this.symbolChangedHandler} />
                        <div className="quip-color-red" style={{ paddingTop: '5px' }}>{this.state.symbolError}</div>
                    </div>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            text={quiptext("Cancel")}
                            onClick={this.dismissPickerHandler} />
                        <quip.apps.ui.Button
                            primary={true}
                            text={quiptext("Save")}
                            onClick={this.updateSymbolHandler} />
                    </div>
                </div>
            </Dialog>;
        }

        if (this.state.termsOpen) {
            terms = <Dialog showBackdrop={true} onDismiss={this.dismissTermsHandler} >
                <div className={Styles.header}>
                    {quiptext("Terms of Use")}
                </div>
                <div style={{ padding: '20px 20px 20px 20px' }} className={Styles.dialogContent}>
                    <h3>Stock Data</h3>
                    <p>Data provided for free by <Link href="https://iextrading.com/developer">IEX</Link>. View IEX’s <Link href="https://iextrading.com/api-exhibit-a/">Terms of Use</Link>.</p>
                </div>
                <div className={Styles.actions}>
                    <quip.apps.ui.Button
                        primary={true}
                        text={quiptext("Close")}
                        onClick={this.dismissTermsHandler} />
                </div>
            </Dialog>;
        }

        let headerInfo = `${companyName} (${symbol})`;
        if (quip.apps.isMobile()) {
            headerInfo = symbol;
        }

        let status = 'live';
        if (error) {
            status = 'offline';
        } else if (Date.now() - lastRefreshed > 60000) {
            status = 'delayed';
        }

        return <div>
            <div className={Styles.main}>
                <div className={Styles.mainHeader}>
                    <div className={Styles.symbol}>{headerInfo}</div>
                    {priceInfo}
                </div>
                <div className={Styles.chart}>
                    <PriceChart id="stock-prices" data={prices} color={chartColor} />
                </div>
                <div className={Styles.mainFooter}>
                    <div className={Styles.timeframe}>
                        {timeframeSelectors}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className={[Styles.status, Styles[status]].join(' ')} />
                        <button style={{ maxHeight: '28px', maxWidth: '28px', border: 'none' }} onClick={() => this.fetchData()}>
                            <svg style={{ fill: 'white' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="refresh" width="100%" height="100%"><path d="M21.5 1.8h-1.4c-.4 0-.7.4-.7.7v3.3c0 .4-.2.6-.6.3-.1-.2-.2-.3-.4-.5-2.3-2.3-5.6-3.2-8.9-2.6-1.1.2-2.3.7-3.2 1.3-2.8 1.9-4.5 4.9-4.5 8.1 0 2.5.9 5 2.7 6.8 1.8 1.9 4.3 3 7 3 2.3 0 4.6-.8 6.3-2.3.3-.3.3-.7.1-1l-1-1c-.2-.2-.7-.3-.9 0-1.7 1.3-4 1.9-6.2 1.3-.6-.1-1.2-.4-1.8-.7-2.6-1.6-3.8-4.7-3.1-7.7.1-.6.4-1.2.7-1.8 1.3-2.2 3.6-3.5 6-3.5 1.8 0 3.6.8 4.9 2.1.2.2.4.4.5.6.2.4-.2.6-.6.6h-3.2c-.4 0-.7.3-.7.7v1.4c0 .4.3.6.7.6h8.4c.3 0 .6-.2.6-.6V2.5c0-.3-.4-.7-.7-.7z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            {picker}
            {terms}
        </div>;
    }
}
