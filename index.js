var mysql = require("mysql"),
  express = require("express"),
  config = require("./config");

var app = express();

var connection = mysql.createConnection({
  host : 'localhost',
  user : config.db_username,
  password : config.db_password,
  database : 'smartpark'
});

connection.connect();

//Testing database connection
app.get("/",function(req,res){
  connection.query("SELECT * FROM transactions",function(err,results){
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
  //user
  //duration
  //parking spot
  data = JSON.parse(req.body);
  //Date objects are automatically formatted (Nice.)
  connection.query("INSERT INTO transactions (id,spot,reserve_time,reserve_length) VALUES(?,?,?,?);",[data.user,data.spot,new Date(),data.length],function(err,results){
    console.log(err);
    console.log(results);
  });
});
app.get("/parking/:id", function(req, res) {
  //request.params.id will get the url parameter for user
  //Query db and build parking state
});

app.listen(3000,function(){
  console.log("Listening on port 3000");
});
