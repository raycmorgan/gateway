/**
 * FIXME: this was just thrown together as an example. I am sure we can make
 * this way better. 
 */

var Response = require('../response.js');

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

function formatDate(now) {
  return pad(now.getDate(), 2) + "/" +
         MONTHS[now.getMonth()] + "/" +
         now.getFullYear() + " " +
         pad(now.getHours(), 2) + ":" +
         pad(now.getMinutes(), 2) + ":" +
         pad(now.getSeconds(), 2);
}

function formatPath(scriptName, pathInfo) {
  return (scriptName === "/" ? "" : scriptName) + pathInfo;
}

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
