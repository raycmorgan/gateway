var utils = require('./utils');

exports.createRequest = function createRequest() {
  return new Request();
}

function Request() {
  this.requestMethod = null; // Must be set
  this.scriptName = "/";
  this.pathInfo = "/";
  this.queryString = "";
  this.serverName = null; // Must be set
  this.serverPort = null; // Must be set
  this.scheme = null; // Must be set
  
  this.gateway = {};
  this.gateway.version = [0,3];
  this.gateway.multithread = false;
  this.gateway.multiprocess = false;
  this.gateway.runonce = null; // Must be boolean
  this.gateway.errors = null; // response to print(...)
  
  this.headers = {};
  
  this.input = null; // Must be an EventEmitter (emits: 'body' and 'complete')
  
  this.request = {};
}

Request.prototype = {
  /**
   * Determine whether the request body contains form-data by checking
   * the request media_type against registered form-data media-types:
   * "application/x-www-form-urlencoded" and "multipart/form-data". The
   * list of form-data media types can be modified through the
   * +FORM_DATA_MEDIA_TYPES+ array.
   * 
   * @returns {Boolean} True when the request has form data 
   */
  hasFormData: function () {
    var mediaType = this.mediaType();
    
    for (var i = 0; i < FORM_DATA_MEDIA_TYPES.length; i++)
      if (FORM_DATA_MEDIA_TYPES[i] === mediaType) {
        return true;
      }
    
    return false;
  },
  
  /**
   * The media type (type/subtype) portion of the CONTENT_TYPE header
   * without any media type parameters. e.g., when CONTENT_TYPE is
   * "text/plain;charset=utf-8", the media-type is "text/plain".
   * 
   * For more information on the use of media types in HTTP, see:
   * http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7
   * 
   * @returns {String} The media type of the request
   */
  mediaType: function () {
    var contentType = this.headers.contentType;
    return (
      contentType && contentType.split(/\s*[;,]\s*/, 2)[0].toLowerCase()
    ) || null;
  },
  
  /**
   * The media type parameters provided in CONTENT_TYPE as a Hash, or
   * an empty Hash if no CONTENT_TYPE or media-type parameters were
   * provided.  e.g., when the CONTENT_TYPE is "text/plain;charset=utf-8",
   * this method responds with the following Hash:
   *   { 'charset' => 'utf-8' }
   * 
   * @returns {Object} The media type params
   */
  mediaTypeParams: function () {
    var contentType = this.headers.contentType;
    if (!contentType) return {};
    
    return contentType.split(/\s*[;,]\s*/).slice(1).map(
            function (s) { return s.split('=', 2); }).reduce(
            function (hash, pair) {
                hash[pair[0].toLowerCase()] = pair[1];
                return hash;
            }, {});
  },
  
  /**
   * Gets an object representation of the cookies that the client
   * sent via the Cookie headers.
   * 
   * @returns {Object} The cookies sent by the client
   */
  getCookies: function () {
    if (!this.headers.cookie) return {};
    
    if (this.request.cookieString != this.headers.cookie) {
      this.request.cookieString = this.headers.cookie;
      
      this.request.cookieHash = utils.parseQuery(this.headers.cookie, /[;,]/g);
      
      // According to RFC 2109:
      // If multiple cookies satisfy the criteria above, they are ordered in
      // the Cookie header such that those with more specific Path attributes
      // precede those with less specific. Ordering with respect to other
      // attributes (e.g., Domain) is unspecified.
      var hash = this.request.cookieHash;
      for (var k in hash)
        if (hash.hasOwnProperty(k) && Array.isArray(hash[k])) {
          hash[k] = hash[k][0];
        }
    }
    
    return this.request.cookieHash;
  }
};


var FORM_DATA_MEDIA_TYPES = [
  null,
  'application/x-www-form-urlencoded',
  'multipart/form-data'
]
