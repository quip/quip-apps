import Styles from "./App.less";
import React from "react";

export default class App extends React.Component {
  render() {
    const reactVersion = React.version;
    return [
      <div key={1} className={Styles.hello}>
        This is running with {reactVersion}
      </div>,
      <div key={2}>
        This is a second item in an array, and should only work in React 16+
      </div>
    ];
  }
}
