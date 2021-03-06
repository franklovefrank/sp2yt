var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {

  var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';


  gapi.client.init({
    // ENTER YOUTUBE API KEY HERE
    apiKey: 'AIzaSyC6rU-AO014Yunw80b8CNPMogRPqZAd8ps',
    clientId: '846829982655-pd9udok649gu45mlc0qq2uc6dp7oaq4m.apps.googleusercontent.com',
    'discoveryDocs': [discoveryUrl],
    // ENTER YOUTUBE API CLIENT ID HERE
    'scope': SCOPE
  }).then(function () {
    GoogleAuth = gapi.auth2.getAuthInstance();

    // Listen for sign-in state changes.
    GoogleAuth.isSignedIn.listen(updateSigninStatus);

    // Handle initial sign-in state. (Determine if user is already signed in.)
    var user = GoogleAuth.currentUser.get();
    setSigninStatus();

    // Call handleAuthClick function when user clicks on
    //      "Sign In/Authorize" button.

    $('#sign-in-or-out-button').click(function () {
      handleAuthClick();
    });
  });
}


function handleAuthClick() {
  if (GoogleAuth.isSignedIn.get()) {
    // User is authorized and has clicked 'Sign out' button.
    GoogleAuth.signOut();
  }
 else {
    GoogleAuth.signIn();
  }
}


function setSigninStatus(isSignedIn) {
  var user = GoogleAuth.currentUser.get();
  var isAuthorized = user.hasGrantedScopes(SCOPE);
  if (isAuthorized) {
    $('#sign-in-or-out-button').html('Sign Out');
    youtubeSignedIn = true;
    youtubeSignedIn && spotifySignedIn ? bothSignedIn = true : console.log("nao")
    bothSignedIn ? document.querySelector('#obtain-playlists').classList.remove('hidden') : console.log("");
  }
  else{
    $('#sign-in-or-out-button').html('Sign In');
  }
}

function updateSigninStatus(isSignedIn) {
  setSigninStatus();
}

// Search for a specified string.
const search = (trackQuery, artistQuery) => {
  const request = gapi.client.youtube.search.list({
    q: `${artistQuery} ${trackQuery}`,
    part: 'snippet',
    maxResults: 1,
  });

  request.execute(response => {
    if (response.code == 403) {
      console.error("Error code 403. Query limit reached.")
    } else {
      let videoId = response.items[0].id.videoId;
      searchResults.push({ videoId: videoId })
    }
  });
}

//
const makeid = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// Creates static playlist
const createPlaylist = playlistData => {
  var request = gapi.client.youtube.playlists.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: `Spotitube ${makeid()}`,
        description: 'Spotify playlist converted to Youtube playlist'
      },
      status: {
        privacyStatus: 'public'
      }
    }
  });
  // Obtaining the playlist id or catches creation error
  request.execute(response => {
    var result = response.result;
    if (result) {
      playlistId = result.id;
      console.log(`Playlist ID is: ${playlistId}`)
      console.log(playlistData)

      // Display playlist here
      document.querySelector('.playlist-container').innerHTML = `
        <p>Playlist generated. Click <a target="blank" href="https://www.youtube.com/playlist?list=${playlistId}">here</a> to see it. (It may take some time for the playlist to generate)</p>
      `

      insertPlaylist(playlistData, playlistId);
    } else {
      console.error("Could not create playlist")
    }
  });
}

// Function that adds video to playlist with playlistId
const addToPlaylist = (videoData, videoId, playlistId) => {
  const details = {
    videoId: videoId,
    kind: 'youtube#video'
  }

  const request = gapi.client.youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: details
      }
    }
  });
  console.log(`Adding video ${videoId} to playlist`)
  request.execute(function (response) {
    console.log(response)
    if (videoData.length > 0) {
      insertPlaylist(videoData, playlistId)
    } else {
      const playlistContainer = document.querySelector('.playlist-container')
      const loadingBar = document.querySelector('.loading-container')

      playlistContainer.classList.remove('hidden')
      loadingBar.classList.add('hidden')
    }
  });
}
