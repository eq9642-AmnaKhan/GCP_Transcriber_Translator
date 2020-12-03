var express = require('express');
var app = express();
var path = require('path');
const fetch = require("node-fetch");
//setting the environemet variables via code for Google speech API
const projectId = "transcriber-295201";
const keyFile = "public/transcriber-XXXXXXXXXXXXX-XXXXXXXXXXXXXX.json";
//including the Speech API
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient({projectId, keyFile});
// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;
// Creates a client
const translate = new Translate({keyFilename: keyFile});



port = 3400;
host = '0.0.0.0';
//host = '127.0.0.20';

app.use(express.static(path.join(__dirname, 'public')));
app.use("/scripts", express.static(__dirname + '/public/javascripts'));
app.use(express.json({ limit:'5000', type:'application/json'}));


app.get('/', function (req, res) {
      res.sendFile(__dirname + '/public/filePicker.html');
});


app.get('/transcription/:id', function (req, res) {
      let fileid = req.params.id;
      console.log(`the file id recieved is ${fileid}`);
      let url = `https://drive.google.com/uc?export=download&id=${fileid}`;
      fetch(url)
                .then(response => response.buffer())
                .then(buf => buf.toString('base64'))
                .then(async (data) =>  {
                      const audio = {
                          content: data,
                        };

                        const config = {
                          encoding: 'LINEAR16',
                          sampleRateHertz: 8000,
                          languageCode: 'en-US'
                        };

                        const request = {
                          audio: audio,
                          config: config
                        };

                        const [response] = await client.recognize(request);
                        const transcription = response.results
                          .map(result => result.alternatives[0].transcript)
                          .join('\n');
                        res.send(transcription);})
                  .catch(function(error) {
                        console.log(error);
                          });

});


app.post('/translate/:tlang', function (req, res){
         console.log(`A POST request recieved: `);
         let target = req.params.tlang;
         let text = req.body.text;

           translate.translate(text, target).then(function(translation){
           console.log(translation[0]);
          res.send(translation[0]);
        });
  });




app.listen(port, host, function(){
  console.log(`Server listening on IPv4: ${host}: ${port}`)
});
