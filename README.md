Gateway
=======

## A web server/application interface that works with Node.js's asynchronous nature. 

**Gateway** is a server/application interface that aims to allow developers to
reuse web components. It is influenced by many different libraries such as:

* [Ruby Rack](http://rack.rubyforge.org/)
* [Python WSGI](http://www.wsgi.org/wsgi/)
* [Erlang EWGI](http://code.google.com/p/ewgi/)

The major difference with these libraries and Gateway is the fact that Node.js
is fully asynchronous. This means that the "simple" API of those libraries of just
returning the response is pretty much useless to Node.js web applications. Instead
we mix the specification of those libraries with the simple API of Node.js's own
HTTP server.

Here is a simple application that utilizes the CommonLogger and Static middleware.

    var Gateway = require('./../lib/gateway');

    function MyApp(request, response) {
      var content = "Hello World";
      response.sendHeader(200, {
        'content-type': 'text/html',
        'content-length': content.length
      });
      response.sendBody(content);
      response.finish();
    };

    
    var builder = Gateway.createBuilder();
    
    builder.use(Gateway.Middleware.CommonLogger);
    builder.use(Gateway.Middleware.Static, {
      root: process.path.dirname(__filename),
      urls: ["/favicon.ico", "/css"]
    });
    builder.use(MyApp);

    builder.boot(Gateway.Handler.NodeHttp, {port: 8000});

Boot the example app with:

    node examples/demo.js

### Note

Gateway currently only runs against the HEAD of Node.js, not the last "official"
release. This is due to the constantly changing API of Node.js. In the future,
once Node.js's API is more stable, Gateway will be maintained in 2 branches,
one for Node.js's latest stable and one for Node.js's HEAD.

### TODO

* Tests!
* Documentation
* More Middleware
  * Body Parsing
  * Multipart Parser
  * Sessions?
  * HTTP Caching?
