"use strict";

const crypto = require('crypto');
var mongodb = require('mongodb').MongoClient;
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

var collection;


      /*
        use cases:
          0. Check for valid URL format (done in server.js, see the '/new/' route
          1a. Check if URL already inserted in DB
          1b. insert url/shortenedurl pair, skip if already inserted
          2. return JSON pair {url, shortened_url}
       */

/*
  known potential issue with insertion: two strings can have the same hash digest substring. 
  Could solve by comparing retrieved entry's url with url we want to add, then manipulate string (ex. change slightly), then call insert again
 */
function insert(url){
  console.log(url);
  var hash = crypto.createHash('sha256');
  var short_url = hash.update(url).digest('hex').slice(0, 9); //adding this to database as part of {url, short_url} pair
  var promise = new Promise(function(resolve, reject){
    
    //do asynchronous lookups within promise
    mongodb.connect(MONGODB_URI, function(err, mongoClient){
      if(!err){ //Successfully connected
        var db = mongoClient.db(process.env.DBNAME);
        db.collection('urls').find({url: url},{projection: {_id: false}}).toArray(function(err, docs){
          if( !err ) {
            if(docs.length == 0) {
              db.collection('urls').insert({url: url, short_url: short_url}, function(err, res) {
                if(!err){
                  console.log("Inserted new url to database.");
                  resolve({url: url, short_url: short_url});
                }
                else{
                  reject(Error("Could not insert new url into database."));
                }
              });
            }
            else{ //url already exists in database
              resolve(docs[0]);
            }
          } else {
            reject(Error("Could not connect to DB"));
          }
        });
      } else {
        reject(Error("Could not connect to DB"));
      }
    });
       
  });
  return promise;
};

/*looks up the shortened url in the database and redirects the user's broswer to the original url*/
function goto(short_url){
  var promise = new Promise(function(resolve, reject){
    mongodb.connect(MONGODB_URI, function(err, mongoClient){
      if(err){
        reject(Error("Could not connect to DB"));
      } else {
        var db = mongoClient.db(process.env.DBNAME);
        db.collection('urls').find({short_url: short_url}).toArray(function(err, docs){
          if(err) {
            reject(Error("Could not connect to DB"));
          } else {
            if(docs.length == 0){
              reject("No matching URL found");
            } else {
              resolve(docs[0].url);
            }
          }
        });
      }
    });
  });
  return promise;
};


function remove(){};


function connect(){};






var asyncDatastore = {
  insert: insert,
  goto: goto,
  remove: remove,
  connect: connect
};

module.exports = {
  async: asyncDatastore
};