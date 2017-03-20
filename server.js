var express = require("express"),
    bodyParser = require("body-parser"),
    fs = require("fs"),
    path = require("path"),
    https = require("https"),
    http = require("http");

var config = require("./config"),
    parking = require("./routes/parking"),
    statistics = require("./routes/statistics"),
    lot = require("./routes/lot"),
    debug = require("./routes/debug"),
    account = require("./routes/account"),
    payment = require("./routes/payment"),
    infraction = require("./routes/infraction"),
    error = require("./utilities/error"),
    logger = require("./utilities/logger"),
    models = require("./models");

var app = express();

//Middleware
app.use(bodyParser.json());
if(true || process.env.NODE_ENV == "development"){
  app.use(function(req, res, next){
    logger.log("debug", "("+(new Date()).toLocaleString()+") " + req.ip + " - " + req.method + " " + req.originalUrl);
    next();
  });
}
app.all('/api/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

//Routes
var api = express.Router();
api.use("/parking", parking);
api.use("/payment", payment);
api.use("/account", account);
api.use("/statistics", statistics);
api.use("/lot", lot);
api.use("/infraction", infraction);

app.use("/api", api);

//Error handling
app.use(error.Handler);

//Handle SSL stuff
var lex = require('greenlock-express').create({
  // set to https://acme-v01.api.letsencrypt.org/directory in production
  server: config.ssl.server,
  approveDomains: config.ssl.domains,
  agreeTos: true,
  email: config.ssl.email,
  debug: (process.env.NODE_ENV != "production")
});

http.createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
  logger.log("debug", "Listening for ACME http-01 challenges");
});

var start = function(){
  https.createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
    logger.log("debug", "Listening for connections");
  });
}

//Handle orm stuff
if(process.env.NODE_ENV == "test"){
  start();
}else{
  models.sequelize.sync().then(start);
}

module.exports = app;
