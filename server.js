//3rd party modules
var mysql = require("mysql"),
    express = require("express"),
    bodyParser = require("body-parser");
//local modules
var config = require("./config");

var app = express();

var connection = mysql.createConnection({
  host : 'localhost',
  user : config.db_username,
  password : config.db_password,
  database : 'smartpark'
});
connection.connect();

var handleAPIError = function(res, status, message){
  //TODO(Seth): Come up with a better way of handling API errors.
  res.status(status);
  res.send(JSON.stringify({status:status, message:message}));
};

//Middleware
app.use(bodyParser.json());

//Routes
//TODO(Seth): consider moving routes to separate modules
//TODO(Seth): Remove test route "/"
app.get("/",function(req, res){
  connection.query("SELECT * FROM transactions",function(err, results){
    res.send(results);
    console.log(results);
    console.log(results[0].id);
  });
});

app.get("/parking", function(req, res) {
  //Query db and build parking state
  res.send(); //send object containing parking state (JSON.stringify)
});

app.post("/parking", function(req, res) {
  //Expected data:
  //userid
  //duration
  //spot
  data = req.body;
  //TODO(Seth): rely on state object instead of making queries for integrity checks.
  connection.query("SELECT 1 FROM transactions WHERE spot = ?", data.spot, function(err, results){
    if(err) throw err;
    if(results.length!=0){
      handleAPIError(res, 409, "Transaction already exists for parking spot with id: " + data.spot);
      return;
    }
    connection.query("SELECT 1 FROM transactions WHERE userid = ?", data.userid, function(err, results){
      if(err) throw err;
      if(results.length!=0){
        handleAPIError(res, 409, "Transaction already exists for user: " + data.userid);
        return;
      }
      //Date objects are automatically formatted (Nice.)
      connection.query("INSERT INTO transactions (userid, spot, reserve_time, reserve_length) VALUES(?, ?, ?, ?);", [data.user, data.spot, new Date(), data.duration], function(err, results){
        if(err) throw err;
        res.status(201);
        res.send(JSON.stringify({status:"201", transaction_id:results.insertId}));
      });
    });
  });
});

app.get("/parking/:id", function(req, res) {
  connection.query("SELECT * FROM transactions WHERE spot = ?", req.params.id, function(err,results){
    if(err) throw err;
    if(results.length==0){
      handleAPIError(res, 404, "No transactional information for parking spot with id: " + req.params.id);
    }else if(results.length>1){
      throw new Error("Multiple transactions with identical parking spot.");
    }else{
      res.send(JSON.stringify(results[0]));
    }
  });
});

app.listen(3000, function(){
  console.log("Listening on port 3000");
});
