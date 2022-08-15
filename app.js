//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const VNDB = require('vndb-api')
const https = require("https");
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

let rawdata = fs.readFileSync('vns.json');
let vns = JSON.parse(rawdata);

let vnids = {}
for (var vn of vns)
{
  vnids[(vn.id).substring(1)] = vn.title
}
const vndb = new VNDB('ArvindKang', {
  // optionally, override any connection options you need to here, like
  minConnection: 1,
  maxConnection: 10,
})

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/error', (req, res) => {
  res.render('fail');
})

app.post('/', async function(req, res){
  var id = String(req.body.apiRequest);

  var more = true;
  var page = 1
  var o;
  var vnList = [];
  while (more == true){
    o = await call("get ulist basic, (uid=" + id +") {\"page\":"+ page +",\"results\":100}")
    if (o == "ERROR"){
        console.log("error")
        res.render('fail', {nameDict: JSON.stringify(nameDict)});
        return
    }
    vnList = vnList.concat(o.items);
    more = o.more
    page+=1
  }

  var nameDict = {}
  for (var item of vnList)
  {
    nameDict[(item.vn)] = vnids[item.vn]
  }

  console.log(nameDict)

  // more = true;
  // page = 1
  // var z;
  // var aliasesList = [];
  // while (more == true){
  //   z = await call("get vn details (id=[" + ids.toString() +"]) {\"page\":"+ page +",\"results\":25,\"sort\":\"id\"}");
  //   console.log(z)
  //   aliasesList = aliasesList.concat(z.items);
  //   more = z.more
  //   page+=1
  // }
  //
  // for (var item of aliasesList)
  // {
  //   var wiki = item.links.wikipedia
  //   var ali = item.aliases
  //
  //   if (wiki && ali){
  //     nameDict[item.id] = nameDict[item.id].concat([wiki],(ali).split("\n"));
  //   }else if (wiki) {
  //     nameDict[item.id] = nameDict[item.id].concat([wiki]);
  //   }else if (ali){
  //     nameDict[item.id] = nameDict[item.id].concat((ali).split("\n"));
  //   }
  //
  // }
  res.render('quiz', {nameDict: JSON.stringify(nameDict)});

});


app.listen(process.env.PORT || 3000, () =>{
  console.log("server is running on port 3000.");
});

async function call(query){
  var res;
  await vndb
    .query(query)
    .then(response => {
      res = response;
    })
    .catch(err => {
      // Handle errors
      console.log(err)
      res = "ERROR"
    })
    return res
}
