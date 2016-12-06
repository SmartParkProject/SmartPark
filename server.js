var express = require("express"),
    bodyParser = require("body-parser"),
    fs = require("fs"),
    https = require("https");

var config = require("./config"),
    parking = require("./routes/parking"),
    debug = require("./routes/debug"),
    account = require("./routes/account"),
    payment = require("./routes/payment"),
    error = require("./utilities/error"),
    logger = require("./utilities/logger"),
    models = require("./models");

var app = express();

//Middleware
app.use(bodyParser.json());
if(process.env.NODE_ENV == "development"){
  app.use(function(req, res, next){
    logger.log("debug", "("+(new Date()).toLocaleString()+") " + req.ip + " - " + req.method + " " + req.originalUrl);
    next();
  });
}

//Routes
app.use("/parking", parking);
app.use("/payment", payment);
app.use("/account", account);

//Error handling
app.use(error.Handler);

//This is not ideal. Perhaps I can abstract the app to its own module and handle
//db connection and so forth in a parent module.
var start = function(){
  var options = {
    cert: fs.readFileSync("fullchain.pem"),
    key: fs.readFileSync("privkey.pem")
  };
  https.createServer(options, app).listen(443,function(){
    logger.log("debug", "Server started.");
  });
}

if(process.env.NODE_ENV == "test"){
  start();
}else{
  models.sequelize.sync().then(start);
}

module.exports = app;
