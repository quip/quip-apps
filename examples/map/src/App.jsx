import Styles from "./App.less";
import quip from "quip";

/* 
  Get your own Google Maps API Key from 
  https://developers.google.com/maps/documentation/javascript/get-api-key 
*/
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_API_KEY_HERE";

const GOOGLE_MAPS_URL = "https://www.google.com/maps/embed/v1/place?key=";
const INPUT_PLACEHOLDER = "Enter an address to map";
const SUBMIT_BTN_TXT = "Add Map";

const { getRootRecord } = quip.apps;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: getRootRecord().get('address')
    };
  }

  handleSubmit = (e) => {
    const enteredAddress = this.refs["text"].value;
    if (enteredAddress.length > 0) {
      this.setState({
        address: enteredAddress
      });
      getRootRecord().set("address", enteredAddress);
    }
  }

  render() {
    const mapUrl = `${GOOGLE_MAPS_URL}${GOOGLE_MAPS_API_KEY}&q=${this.state.address}`;
    return <div className={Styles.container}>
      {
        /* 
          If a location was not entered previously,
          we present an input box to add locartion 
        */
        !this.state.address &&
        <div>
          <input
            className={Styles.address}
            ref="text" type="text"
            placeholder={INPUT_PLACEHOLDER}>
          </input>
          <button
            className={Styles.submit}
            onClick={this.handleSubmit}>
            {SUBMIT_BTN_TXT}
          </button>
        </div>
      }
      {
        /* 
          We already have the location in the document, 
          so we use that and show the map 
        */
        this.state.address &&
        <iframe
          className={Styles.noborder}
          width="600"
          height="450"
          frameborder="0"
          src={mapUrl}>
        </iframe>
      }
    </div>;
  }
}
