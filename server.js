 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var db = require('./database');
var app = express();

const bodyParser = require('body-parser');
const dns = require('dns');
const ejs = require('ejs');
const cors = require('cors');

const uriScheme = "^[a-zA-Z][a-zA-Z0-9+.-]*:";
const domainLabel = "[a-zA-Z0-9][a-zA-Z0-9_-]*"
const domainName = "\/\/" + domainLabel + "(\." + domainLabel + ")*"
const uriPath = "((\/[^/].*)|\/)"
const uriFormat = new RegExp(uriScheme + domainName + uriPath + "$" );

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
        res.render('./index.ejs');
    })

app.route('/api/shorturl/:id')
    .get(function(req, res) {     
        db.async.goto(req.params.id).then(function(result){
          res.redirect(result);
        }).catch(function(err){
          res.send(err);
        });
});

app.route('/api/shorturl/new/') //need to parse hostname without scheme (ex. https://) "{[a-zA-Z]+://"
  .post(function(req, res) {
  if(!req.body.shortUrl){
    res.json({error: "No url given"});
    return
  }
  /*parse; we split twice, once to remove :// at the start of hostname, 
  and once to remove / at end of hostname*/
  
  let url = req.body.shortUrl.split("://", 2);
  let hostname = "";
  if(url.length === 2) {
    hostname = url[1].split("/", 1);
  } else {
    hostname = url[0].split("/", 1);
  }

  dns.lookup(hostname[0], (err, address, family) => {
    if(err) {
      res.json({error: "Invalid URL"});
    }
    else { 
      /*note: although we check if the hostname is valid, the rest is unchecked.
          It is up to the user to ensure they use the proper scheme and path.
      */
      db.async.insert(req.body.shortUrl).then( (result) => {
        res.send(result);
      }).catch( (err) => {
        res.json({error: "Invalid URL"});
      });
    }
  });
  
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

