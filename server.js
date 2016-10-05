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

var parkingState = new Array(config.range_parking_spots);

var buildParkingState = function(){
  connection.query("SELECT * FROM transactions",function(err, results){
    if(err) throw err;
    results.map(function(current, index){
      parkingState[current.spot] = current;
    });
  });
};

var handleAPIError = function(res, status, message){
  //TODO(Seth): Come up with a better way of handling API errors.
  res.status(status);
  res.send(JSON.stringify({status:status, message:message}));
};

//Initialization
buildParkingState();

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
  res.send(JSON.stringify(parkingState)); //send object containing parking state (JSON.stringify)
});

app.post("/parking", function(req, res) {
  //Expected data:
  //userid
  //duration
  //spot
  data = req.body;
  if(data.spot>config.range_parking_spots)
    return handleAPIError(res, 400, "Parking spot id exceeds maximum range for value.");

  if(parkingState[data.spot])
    return handleAPIError(res, 409, "Transaction already exists for parking spot with id: " + data.spot);

  if(parkingState.find(a => a!=null && a.userid == data.userid))
    return handleAPIError(res, 409, "Transaction already exists for user: " + data.userid);
  //TODO(Seth): handle invalid userid length

  //Date objects are automatically formatted (Nice.)
  connection.query("INSERT INTO transactions (userid, spot, reserve_time, reserve_length) VALUES(?, ?, ?, ?);", [data.userid, data.spot, new Date(), data.duration], function(err, results){
    if(err) throw err;
    parkingState[data.spot] = data;
    res.status(201);
    res.send(JSON.stringify({status:"201", transaction_id:results.insertId}));
  });
});

app.get("/parking/:id", function(req, res) {
  if(parkingState[req.params.id]){
    res.send(JSON.stringify(parkingState[req.params.id]));
  }else{
    handleAPIError(res, 404, "No transactional information for parking spot with id: " + req.params.id);
  }
});

app.listen(3000, function(){
  console.log("Listening on port 3000");
});
