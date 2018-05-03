"use strict";

var mongodb = require('mongodb').MongoClient;
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

var collection;


function newEntry(url){
  /*testing connecting to the database*/
  console.log(url);
  mongodb.connect(MONGODB_URI, function(err, mongoClient){
    if(err) {
      console.log("had a problem, boss");
      console.log(MONGODB_URI);
    }
    else {
      console.log("Connected successfully");
      var db = mongoClient.db(process.env.DBNAME);
      //console.log(urls.collection('urls'))
      
      /*use cases:
          0. Check for valid URL format
          1a. Check if URL already inserted in DB
          1b. insert url/shortenedurl pair, skip if already inserted
          2. return JSON pair {url, shortened_url}
      */
      //URL.valid
      
      //Assume URL valid for now
      db.collection('urls').find({url: url}).toArray(function(err, docs){
        console.log("Found: " + docs.length + " entries");
        mongoClient.close();
        //return docs[0];
      });
}
  })};


function get(){};


function remove(){};


function connect(){};






var asyncDatastore = {
  newEntry: newEntry,
  get: get,
  remove: remove,
  connect: connect
};

module.exports = {
  async: asyncDatastore
};