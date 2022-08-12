//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const VNDB = require('vndb-api')

const app = express();
const https = require("https");

const vndb = new VNDB('ArvindKang', {
  // optionally, override any connection options you need to here, like
  minConnection: 1,
  maxConnection: 10,
})

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/', (req, res) => {
  var request = String(req.body.apiRequest);
  console.log(request)
  vndb
    .query(request)
    .then(response => {
      // Use the response
      console.log(response);
      res.write(JSON.stringify(response));
      res.end();
    })
    .catch(err => {
      // Handle errors
      console.log(err)
      res.write(JSON.stringify(err));
      res.end();
    })

});

app.listen(process.env.PORT || 3000, () =>{
  console.log("server is running on port 3000.");
});
