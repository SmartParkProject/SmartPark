//3rd party modules
var mysql = require("mysql"),
    express = require("express"),
    bodyParser = require("body-parser"),
    winston = require("winston");
//local modules
var config = require("./config"),
    Parking = require("./controllers/Parking"),
    Debug = require("./controllers/Debug"),
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

//Create connection pool for database.
var database = mysql.createPool(config.db);

//Middleware
app.use(bodyParser.json());
app.use(function(req, res, next){
  logger.log("debug", "("+(new Date()).toLocaleString()+") " + req.ip + " - " + req.method + " " + req.originalUrl);
  next();
});

//Routes
var parking = new Parking(database, logger);

app.use("/parking", parking);

if(process.env.NODE_ENV !== 'production'){
  logger.log("warn","!!!DEBUG FEATURES ACTIVE");
  var debug = new Debug(database, logger, parking);
  app.use("/debug", debug);
}

//Error handling
app.use(new error.Handler(logger));

app.set('port', process.env.PORT || 80);
app.listen(app.get('port'), function(){
  logger.log("debug", "Listening on port " + app.get('port'));
});
