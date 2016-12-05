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
app.use(function(req, res, next){
  logger.log("debug", "("+(new Date()).toLocaleString()+") " + req.ip + " - " + req.method + " " + req.originalUrl);
  next();
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

//Routes
app.use("/parking", parking);
app.use("/payment", payment);
app.use("/account", account);

//Error handling
app.use(error.Handler);

models.sequelize.sync().then(function(){
  var options = {
    cert: fs.readFileSync("fullchain.pem"),
    key: fs.readFileSync("privkey.pem")
  };
  https.createServer(options, app).listen(443,function(){
    logger.log("debug", "Server started.");
  });
});
