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

Here is a simple application that utilizes the Static middleware.

    var Gateway = require('../lib/gateway.js');

    function MyApp(request, response) {
      var content = "Hello World";
      response.sendHeader(200, {
        'Content-Type': 'text/html',
        'Content-Length': content.length
      });
      response.sendBody(content);
      response.finish();
    };

    
    var builder = Gateway.createBuilder();

    builder.use(Gateway.Middleware.Static, {
      root: node.path.dirname(__filename),
      urls: ["/favicon.ico", "/css"]
    });
    builder.use(MyApp);

    builder.boot(Gateway.Handler.NodeHttp, {port: 8000});

### TODO

* Tests!
* Documentation
* More Middleware
  * Body Parsing
  * Multipart Parser
  * Sessions?
  * HTTP Caching?
