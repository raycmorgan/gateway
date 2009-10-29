var Response = require('../response.js');

/**
 * CommonLogger is middleware for Gateway that logs requests in the Apache
 * Common Log format: http://httpd.apache.org/docs/1.3/logs.html#common
 * 
 * @param {Function} app The new application/middleware in the stack
 * @returns {Function} The CommonLogger middleware
 */
exports.CommonLogger = function CommonLogger(app) {
  return function (request, response) {
    var begin = new Date();
    var myResponse = Response.createResponse();
    
    myResponse.
      addListener('header', function (status, headers) {
        response.sendHeader(status, headers);
        log(request, begin, status, headers);
      }).
      addListener('body', function (chunk, encoding) {
        response.sendBody(chunk, encoding);
      }).
      addListener('complete', function () {
        response.finish();
      });
    
    app(request, myResponse);
  }
}

/**
 * This function is responsible for actually construction the log message and
 * printing it to request.gateway.errors.
 * 
 * @param {Request} request The current gateway request object
 * @param {Date} begin The time at which the request was started
 * @param {Number|String} status The response status code
 * @param {Object} headers The response headers
 */
function log(request, begin, status, headers) {
  var now = new Date();
          
  var address   = request.headers['x-forwarded-for'] || request.remoteAddr || "-";
  var user      = request.remoteUser || "-";
  var timestamp = formatDate(now);
  var method    = request.requestMethod;
  var path      = formatPath(request.scriptName, request.pathInfo);
  var query     = request.queryString ? "?" + request.queryString : "";
  var version   = request.scheme.toUpperCase() + "/" + (request.serverProtocol || "");
  var size      = headers['content-length'] || "-";
  var duration  = now - begin;
  
  var log = address+' - '+user+' ['+timestamp+'] '+
            '"'+method+' '+path+query+' '+version+'" '+
            status+' '+size+
            ' '+duration;
  
  request.gateway.errors.print(log);
}

/**
 * Used to format the timestamp.
 * 
 * @private
 * @param {Date} now The date to format
 * @returns {String} The formatted date 
 */
function formatDate(now) {
  return pad(now.getDate(), 2) + "/" +
         MONTHS[now.getMonth()] + "/" +
         now.getFullYear() + " " +
         pad(now.getHours(), 2) + ":" +
         pad(now.getMinutes(), 2) + ":" +
         pad(now.getSeconds(), 2);
}

/**
 * Used to format the path. Removes scriptName if it is "/".
 * 
 * @private
 * @param {String} scriptName The scriptName from the request
 * @param {String} pathInfo The pathInfo from the request
 * @returns {String} The formatted path
 */
function formatPath(scriptName, pathInfo) {
  return (scriptName === "/" ? "" : scriptName) + pathInfo;
}

/**
 * Utility function for padding numbers. 
 * 
 * @private
 */
function pad(str, num, padChar) {
  str += "";
  padChar = padChar || "0";
  return new Array(num - str.length + 1)
             .join(padChar) + str;
}

var MONTHS = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
};
