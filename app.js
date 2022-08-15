//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const VNDB = require('vndb-api')
const https = require("https");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const vndb = new VNDB('ArvindKang', {
  // optionally, override any connection options you need to here, like
  minConnection: 1,
  maxConnection: 10,
})

app.get('/', (req, res) => {
  var day = "tuesday";
  res.render('index');
});

app.post('/', async function(req, res){
  var id = String(req.body.apiRequest);

  var more = true;
  var page = 1
  var o;
  var vnList = [];
  while (more == true){
    o = await call("get ulist basic, (uid=" + id +") {\"page\":"+ page +",\"results\":100}")
    console.log(o)
    vnList = vnList.concat(o.items);
    more = o.more
    page+=1
  }

  var vnids = []
  for (var vn of vnList)
  {
    vnids.push(vn.vn)
  }
  var quoteList = [];

  var more = true;
  var page = 1
  var x;
  var quoteList = [];
  while (more == true){
    x = await call("get quote basic (id=[" + vnids.toString() +"]) {\"page\":"+ page +",\"results\":25,\"sort\":\"id\"}");
    console.log(x)
    quoteList = quoteList.concat(x.items);
    more = x.more
    page+=1

  }

  var dict = {};
  var nameDict = {}
  var ids = []
  for (var item of quoteList)
  {
    if (item.id in dict){
      dict[item.id].push(item.quote);
    } else{
      dict[item.id] = [item.quote];
      nameDict[item.id] = [item.title]
      ids.push(item.id);
    }
  }

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
  res.render('quiz', {dict: JSON.stringify(dict), nameDict: JSON.stringify(nameDict)});

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
    })
    return res
}
