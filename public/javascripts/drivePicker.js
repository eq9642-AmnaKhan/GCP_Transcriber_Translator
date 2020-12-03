
// The API key obtained from the Google API Console.
// Replace with your own API key, or your own key.
var API_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// The Client ID obtained from the Google API Console. Replace with your own Client ID.
var CLIENT_ID = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// The APP ID obtained from the Google API Console. Replace with your own APP ID and
// keep in sync with API_KEY and CLIENT_ID.
var APP_ID = "transcriber-295201";

// API discovery doc URL for APIs used by this example
var DISCOVERY_DOCS = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.file';

var GoogleAuth;
var GoogleUser;
var pickFileButton = document.getElementById('pick_file_button');
var transcribeButton = document.getElementById('transcribe_button');
var translateButton = document.getElementById('translate_button');
var fileText = document.getElementById('content');
var transcribeText = document.getElementById('transcribed-content');
var selectedLang = document.getElementById('lang_select');
var translateText = document.getElementById('translated-content');


pickFileButton.onclick = handlePickFileButtonClick;
transcribeButton.onclick = handleTranscribeVideoClick;
translateButton.onclick = handleTranslate;

/**
 *  On load, called to load the API client library, the auth2 library, and the picker library.
 */
function handleClientLoad() {
  gapi.load('client:auth2:picker', initClient);
}

/**
 *  Initializes the API client library and sets the authorization and current user.
 */
function initClient() {
  gapi.client.init({
    client_id: CLIENT_ID,
    discoveryDocs: [DISCOVERY_DOCS],
    scope: SCOPES
  }).then(function () {
    GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleUser = GoogleAuth.currentUser.get();
    pickFileButton.style.display = 'block';
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2), transcribeText);
  });
}

/**
 * Ensures the user has the correct scopes prior to displaying the picker.
 */
function handlePickFileButtonClick() {
  if (!GoogleUser.hasGrantedScopes(SCOPES)) {
    GoogleUser.grant({
      scope: SCOPES
    }).then(displayPicker, function(err) {
      // Handle error/declined auth...
    });
  } else {
    displayPicker();
  }
}

/**
 * Create and render a Picker for selecting any file on My Drive.
 * We use .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
 * to ensure files in shared drives are included.
 */
function displayPicker() {
  // Fetch current token
  let authResponse = GoogleUser.getAuthResponse(true);

  var view = new google.picker.View(google.picker.ViewId.DOCS);
  var picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
    .setAppId(APP_ID)
    .setOAuthToken(authResponse.access_token)
    .addView(view)
    .setDeveloperKey(API_KEY)
    .setCallback(pickerCallback)
    .build();
  picker.setVisible(true);
}

/**
 * Called when a file is picked. This function gathers metadata from
 * the picked documents and from calling get on the fileId.
 */
function pickerCallback(data) {
  var document = data[google.picker.Response.DOCUMENTS][0];
  // The following information is passed to the callback, while other has to be
  // retrieved by calling files.get() on a file (below)
  var fileName = document[google.picker.Document.NAME];
  var URL = document[google.picker.Document.URL];
  var lastModifiedDate = document[google.picker.Document.LAST_EDITED_UTC];
  var date = new Date(lastModifiedDate);
  window.fileId = document[google.picker.Document.ID];

  appendPre('Audio File: ' + fileName, fileText);
  //appendPre('Last Modified Date: ' + date);
  transcribe_button.style.display = 'block';
  transcribeText.style.display ='block';
}
/**
 * Helper method to display content to the screen.
 */


function appendPre(message, fieldPre) {
      if (fieldPre.hasChildNodes()) {
       fieldPre.removeChild(fieldPre.childNodes[0]);
    }
      var textContent = document.createTextNode(message + '\n');
      fieldPre.appendChild(textContent);
}



function handleTranscribeVideoClick(){
      let id =  window.fileId;
      fetch(`/transcription/${id}`)
          .then(response => response.text())
          .then((data) => {
                appendPre(data, transcribeText);
                window.textEnglish = data;
                      })
          .catch(e => {
            console.log("The error is: ", e);
            appendPre(`Error: Please select the correct format for an audio file!`, transcribeText);
          });
}



function handleTranslate(){
    //var text = window.textEnglish;
        var langTarget = selectedLang.value;

        fetch(`/translate/${langTarget}`, {
                  method: 'POST',
                  headers: {"Content-type": "application/json"},
                  body: JSON.stringify({
                        text: window.textEnglish })
                  }).then(response => response.text())
                  .then((data) => {
                        appendPre(data, translateText);
                  }).catch(e => {
                       console.log("The error is: ", e);
                     });
}
