import React, {Component} from "react";

export default class App extends Component {
    imageNode = null;

    imageClickHandler = e => {
        const imageRecord = this.props.image;
        if (!imageRecord) {
            return;
        }
        this.imageNode.addCommentAtPoint(e.clientX, e.clientY);
    };

    async setImage() {
        const imageRecord = this.props.image;
        const imageBlob = await getImage("https://image/url.png");
        imageRecord.uploadFile(imageBlob);
    }

    render() {
        const imageRecord = this.props.image;
        console.debug("imageRecord", imageRecord);
        return (
            <div onClick={this.imageClickHandler}>
                <quip.apps.ui.Image
                    allowResizing={false}
                    onWidthAndAspectRatioUpdate={() => {}}
                    ref={node => (this.imageNode = node)}
                    record={imageRecord}
                    responsiveToContainerWidth={true}
                />
            </div>
        );
    }
}

function getImage(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.arrayBuffer();
        })
        .then(buffer => {
            return new Blob([new Uint8Array(buffer)]);
        });
}
