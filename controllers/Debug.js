var express = require("express");
var config = require("../config");

module.exports = function Debug(database, logger, parking){
  var router = express.Router();

  router.get("/clear", function(req, res, next) {
    database.getConnection(function(err,connection){
      if(err) throw err;
      connection.query("DELETE FROM transactions",function(err, results){
        connection.release();
        if(err) throw err;
        res.status(200);
        res.send("Records deleted.");
      });
    });
  });

  router.get("/fill", function(req, res, next) {
    database.getConnection(function(err,connection){
      //In theory, these variables are local to the callback for getconnection
      //and should not be modified by subsequent calls to /fill.
      var total = 0;
      var done = 0;
      if(err) throw err;
      connection.query("DELETE FROM transactions",function(err, results){
        if(err) throw err;
      });
      for(i=0;i<config.max_parking_spots;i++){
        if(Math.random()>.5) continue;
        total++;
        var padded = i.toString();
        while(padded.length<3) padded = "0" + padded;
        var u = "1234567890ab" + padded;
        var d = new Date(new Date().getTime()+(Math.floor(Math.random()*24)*60*60*1000));
        var l = Math.floor(Math.random()*24);
        connection.query("INSERT INTO transactions (userid, spot, reserve_time, reserve_length) VALUES(?, ?, ?, ?)", [u, i, d, l], function(err, results, fields){
          if(err) throw err;
          done++;
          if(done==total){ //This is a bad way of doing this. That being said; debug code.
            connection.release();
            res.status(200);
            res.send("Records filled with random data.");
          }
        });
      }
    });
  });

  return router;
}
