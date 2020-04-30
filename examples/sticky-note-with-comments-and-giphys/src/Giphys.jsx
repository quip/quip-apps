import Styles from "./Giphys.less";
import loadingGiphyGif from "file-loader?publicPath=dist/!./giphy-loading.gif";

const GIPHY_API_KEY = "";
const GIPHY_LIMIT = 4;
const GIPHY_RATING = "PG-13";

const DEFAULT_TEXT = "Portlandia";

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export default class Giphys extends React.Component {
    constructor(props) {
        super();
        this.state = {
            giphys: [],
            loadingGiphy: false,
        };

        this.onContentChange = debounce(this.onContentChange, 1000);
    }

    componentDidMount() {
        const {record} = this.props;
        const text = record.getTextContent();
        if (text) {
            this.getGiphys(text);
        }

        record.listenToContent(this.onContentChange);
    }

    componentWillUnmount() {
        const {record} = this.props;
        record.unlistenToContent(this.onContentChange);
    }

    onContentChange = r => {
        const text = r.getTextContent();
        console.debug("new text", text);
        this.getGiphys(text);
    };

    getGiphys = async text => {
        this.setState({loadingGiphy: true});
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(
                text)}&api_key=${GIPHY_API_KEY}&limit=${GIPHY_LIMIT}&rating=${GIPHY_RATING}`);
        this.setState({loadingGiphy: false});
        if (!response.ok) {
            console.error("ERROR", {response});
            throw Error(response.status);
        }
        const json = await response.json();
        console.log("GIPHY", {json});
        this.setState({giphys: json.data});
    };

    render() {
        const {giphys, loadingGiphy} = this.state;
        return <div className={Styles.giphys}>
            {loadingGiphy && <img
                alt="Loading..."
                className={Styles.loading}
                src={loadingGiphyGif}/>}
            {giphys.map(g => <img
                className={Styles.giphy}
                src={g.images.fixed_width.url}
                alt={g.title}
                title={g.title}
                style={{
                    width: g.images.fixed_width.width,
                }}/>)}
        </div>;
    }
}
