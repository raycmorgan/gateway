var Gateway = require('./../lib/gateway');
var sys = require('sys');

function MyApp(request, response) {
  if (request.requestMethod === 'POST') {
    Gateway.utils.parseURLEncodedBody(request, function (body) {
      sys.p(body);
    });
  }
  
  var contents = '\
<html>            \
  <body>          \
    <form action="" method="post">                          \
      Name: <input type="text" name="person[name]" /><br /> \
      Age:  <input type="text" name="person[age]" /><br />  \
      <input type="submit" value="Go" />                    \
    </form>       \
  </body>         \
</html>           \
  ';
  
  response.sendHeader(200, {
    'content-type': 'text/html',
    'content-length': contents.length
  });
  response.sendBody(contents);
  response.finish();
}


var builder = Gateway.createBuilder();

builder.use(Gateway.Middleware.CommonLogger);
builder.use(Gateway.Middleware.ContentType);
builder.use(MyApp);

builder.boot(Gateway.Handler.NodeHttp, {port: 8000});
