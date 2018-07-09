import React, { Component } from 'react';
import quip from 'quip';

class Link extends Component {
    
    clickHandler = (event) => {
        event.preventDefault();
        quip.apps.openLink(this.props.href);
    }

    render() { 
        return (
            <a href={this.props.href} onClick={this.clickHandler} style={{color: quip.apps.ui.ColorMap.BLUE.VALUE}}>{this.props.children}</a>
        );
    }
}
 
export default Link;