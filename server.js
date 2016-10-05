//3rd party modules
var mysql = require("mysql"),
    express = require("express"),
    bodyParser = require("body-parser");
//local modules
var config = require("./config"),
    Parking = require("./Parking");

var app = express();

var database = mysql.createConnection({
  host : 'localhost',
  user : config.db_username,
  password : config.db_password,
  database : 'smartpark'
});
database.connect();

//Middleware
app.use(bodyParser.json());

//Routes
var parking = new Parking(database);

app.use("/parking",parking);

app.listen(3000, function(){
  console.log("Listening on port 3000");
});
