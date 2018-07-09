import quip from 'quip';
import 'whatwg-fetch';

class StockRecord extends quip.apps.RootRecord {
    static CONSTRUCTOR_KEY = 'Stock';

    static getProperties() {
        return {
            symbol: "string",
            lastRefreshed: "number",
            prices: "array",
            timeframe: "string",
            company: "string",
            color: "string",
            error: "boolean"
        };
    }

    static getDefaultProperties() {
        return {
            symbol: 'CRM',
            lastRefreshed: 0,
            prices: [],
            timeframe: '1m',
            company: 'Salesforce.com Inc',
            color: quip.apps.ui.ColorMap.RED.KEY,
            error: false
        };
    }

    seed() {
        const defaultValues = this.constructor.getDefaultProperties();

        const colors = [
            quip.apps.ui.ColorMap.RED.KEY,
            quip.apps.ui.ColorMap.ORANGE.KEY,
            quip.apps.ui.ColorMap.YELLOW.KEY,
            quip.apps.ui.ColorMap.GREEN.KEY,
            quip.apps.ui.ColorMap.BLUE.KEY,
            quip.apps.ui.ColorMap.VIOLET.KEY
        ];
        const randomColor = colors[Math.floor((Math.random() * colors.length))];
        quip.apps.updateToolbar({
            highlightedCommandIds: [randomColor]
        });
        defaultValues.color = randomColor;

        // These have to be seeded too since the connect function relies
        // on these being set on the record for first render
        Object.keys(defaultValues).forEach((key, i) => {
            this.set(key, defaultValues[key]);
        });
    }

    updateSymbol(symbol) {
        return this.fetchCompanyInfo(symbol)
            .then(() => {
                this.set('symbol', symbol);
                return this.fetchData();
            });
    }

    updateTimeframe(timeframe) {
        this.set('timeframe', timeframe);
        return this.fetchData();
    }

    fetchCompanyInfo(symbol) {
        return fetch(`https://api.iextrading.com/1.0/stock/${symbol}/company`)
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    const err = new Error(response.statusText);
                    err.response = response;
                    throw err;
                }
            })
            .then(company => {
                this.set('company', company.companyName);
            });
    }

    fetchData() {
        return fetch(`https://api.iextrading.com/1.0/stock/${this.get('symbol')}/chart/${this.get('timeframe')}?changeFromClose=true`)
            .then(response => response.json())
            .then(chart => {
                this.set('prices', chart.map(datapoint => {
                    return {
                        date: datapoint.date,
                        label: datapoint.label,
                        open: datapoint.marketOpen || datapoint.open,
                        high: datapoint.marketHigh || datapoint.high,
                        low: datapoint.marketLow || datapoint.low,
                        close: datapoint.marketClose || datapoint.close,
                        pctChange: datapoint.changeOverTime
                    };
                }));
                this.set('lastRefreshed', Date.now());
                this.set('error', false);
            })
            .catch(err => {
                this.set('error', true);
            });
    }
}

export default () => {
    const classes = [StockRecord];
    classes.forEach(c => quip.apps.registerClass(c, c.CONSTRUCTOR_KEY));
};