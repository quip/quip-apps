/**
 * Spotify live app.
 */

var kPlaylistHeight = 380;
var kTrackHeight = 80;
var kSpotifyWidth = 300;

class SpotifyRoot extends quip.apps.RootRecord {
    static getProperties() {
        return {
            src: "string",
            isPlaylist: "boolean"
        };
    }
}
quip.apps.registerClass(SpotifyRoot, "root");

function setPlaylist(userId, playlistId) {
    var rootRecord = quip.apps.getRootRecord();
    rootRecord.set(
        "src", "https://open.spotify.com/embed?uri=spotify%3Auser%3A" + userId +
        "%3Aplaylist%3A" + playlistId + "&theme=white");
    rootRecord.set("isPlaylist", true);
}

quip.apps.initialize({
    initializationCallback: function(root, params) {
        var rootRecord = quip.apps.getRootRecord();
        if (params.isCreation) {
            if (params.creationUrl && params.creationUrl.split("/playlist/").length == 2) {
                // Create a playlist from the pasted playlist link
                var playlistSplit = params.creationUrl.split("/playlist/");
                var playlistId = playlistSplit[1];
                var userId = playlistSplit[0].split("/user/")[1];
                setPlaylist(userId, playlistId);
            } else if (params.creationUrl && params.creationUrl.split("/track").length == 2) {
                // Create a track from the pasted song link
                var trackId = params.creationUrl.split("/track/")[1];
                rootRecord.set(
                    "src", "https://open.spotify.com/embed/track/" + trackId);
                rootRecord.set("isPlaylist", false);
            } else {
                // Default playlist for insertion
                setPlaylist("zs5qow8621xkm7gmbs6ffjhkt", "6oFfgRVL3BtJbZKqPmqnSE");
            }
        }
        // Set up Spotify iframe inside of the app iframe
        var height = rootRecord.get("isPlaylist") ? kPlaylistHeight : kTrackHeight;
        root.innerHTML = '<iframe width="' + kSpotifyWidth + '" height="' + height + '" src="' +
            rootRecord.get("src") +
            '" frameborder="0" allowtransparency="true"></iframe>';
        var iframe = root.firstChild;
        quip.apps.registerEmbeddedIframe(iframe);
    }
});
