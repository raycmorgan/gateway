var Gateway = require('./../lib/gateway');
var sys = require('sys');

function MyApp(request, response) {
  request.post(function (body) {
    sys.p(body);
  });
  
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
  response.write(contents);
  response.close();
}


var builder = new Gateway.Builder();

builder.use(Gateway.Middleware.CommonLogger);
builder.use(Gateway.Middleware.ContentType);
builder.use(MyApp);

builder.listen(Gateway.Handler.NodeHttp, {port: 8000});
