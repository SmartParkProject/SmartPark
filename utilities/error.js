var exports = module.exports;

const ERROR_API = 1;

exports.Handler = function(logger){
  return function(err, req, res, next){
    if(err.type === ERROR_API){
      logger.log("warn", req.ip, err);
      res.status(err.statusCode);
      res.json({status:err.statusCode, message:err.message});
    }else{
      logger.log("error", err);
      next(err);
    }
  }
}

var ErrorFactory = function(){
  this.getAPIError = function(statusCode, default_message){
    return function(message, errorCode){
      this.message = message || default_message;
      this.statusCode = statusCode;
      this.errorCode = errorCode || statusCode;
      this.type = ERROR_API;
    }
  }
}

errorFactory = new ErrorFactory();

exports.BadRequest = errorFactory.getAPIError(400, "Bad request.");
exports.Unauthorized = errorFactory.getAPIError(401, "Missing or invalid authentication token.");
exports.Forbidden = errorFactory.getAPIError(403, "Permissions not met for the request.");
exports.NotFound = errorFactory.getAPIError(404, "The requested resource couldn't be found.");
exports.Conflict = errorFactory.getAPIError(409, "There was a conflict with the request.");
