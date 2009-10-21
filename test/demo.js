var Gateway = require('../lib/gateway.js');

function MyApp(request, response) {
  response.sendHeader(200, {'Content-Type': 'text/plain'});
  response.sendBody('Hello World!');
  response.finish();
}


var builder = Gateway.createBuilder();

builder.use(Gateway.Middleware.Lint);
builder.use(Gateway.Middleware.CommonLogger);
builder.use(Gateway.Middleware.Static, {
  root: node.path.dirname(__filename),
  urls: ["/favicon.ico", "/css", "/images"]
});
builder.use(MyApp);

builder.boot(Gateway.Handler.NodeHttp, {port: 8000});
