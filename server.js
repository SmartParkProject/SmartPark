//3rd party modules
var mysql = require("mysql"),
    express = require("express"),
    bodyParser = require("body-parser"),
    winston = require("winston");
//local modules
var config = require("./config"),
    Parking = require("./controllers/Parking"),
    error = require("./utilities/error");

var app = express();

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename:"log/critical.log",
      level:"info"
    }),
    new (winston.transports.Console)({level:"debug"})
  ]
});

var database = mysql.createConnection({
  host : 'localhost',
  user : config.db_username,
  password : config.db_password,
  database : 'smartpark'
});
database.connect(function(err){
  if(err){
    logger.log("error", err); //This doesn't get logged. May need to look into using winston.handleExceptions
    throw err;
  }
  logger.log("debug", "Connected to database as id " + database.threadId);
});

//Middleware
app.use(bodyParser.json());
app.use(function(req, res, next){
	logger.log("debug", "("+(new Date()).toLocaleString()+") " + req.ip + " - " + req.originalUrl);
	next();
});

//Routes
var parking = new Parking(database, logger);

app.use("/parking", parking);

//Error handling
app.use(new error.Handler(logger));

app.listen(3000, function(){
  logger.log("debug", "Listening on port 3000");
});
