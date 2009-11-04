var mjsunit = require('mjsunit');
var mock    = require('../lib/gateway/mock');

function assertMatch(a, b, errMsg) {
  mjsunit.assertEquals(
    JSON.stringify(a),
    JSON.stringify(b),
    errMsg
  );
}

exports.tests = [

function testParseCookie() {
  var req = mock.requestFor('GET', '', {'headers': {'cookie': "foo=bar;quux=h&m"}});
  
  assertMatch({'foo': 'bar', 'quux': 'h&m'}, req.getCookies());
  assertMatch({'foo': 'bar', 'quux': 'h&m'}, req.getCookies());
  delete req.headers.cookie;
  assertMatch({}, req.getCookies());
},

function testParseCookiesRFC2109() {
  var req = mock.requestFor('GET', '', {'headers': {'cookie': "foo=bar;foo=car"}});
  assertMatch({'foo': 'bar'}, req.getCookies());
},

function testMediaType() {
  var req = mock.requestFor('GET', '', {'headers': {'contentType': 'text/html'}});
  assertMatch('text/html', req.mediaType());
  assertMatch('text/html', req.headers.contentType);
  
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "text/html; charset=utf-8"}});
  assertMatch('text/html', req.mediaType());
  assertMatch('text/html; charset=utf-8', req.headers.contentType);
  assertMatch('utf-8', req.mediaTypeParams().charset);
  
  var req = mock.requestFor('GET', '', {});
  assertMatch(null, req.mediaType());
  assertMatch(undefined, req.headers.contentType);
},

function testHasFormData() {
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "application/x-www-form-urlencoded"}});
  assertMatch(true, req.hasFormData());
  
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "multipart/form-data"}});
  assertMatch(true, req.hasFormData());
  
  var req = mock.requestFor('GET', '', {});
  assertMatch(true, req.hasFormData(), "No content type should make hasFormData return true");
  
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "text/html"}});
  assertMatch(false, req.hasFormData());
},

function testParseURLEncodedBody() {
  var content = "hello=world"
  var input = mock.createMockInput();
  
  var req = mock.requestFor('POST', '', {
    'input': input,
    'headers': {
      'content-type': "application/x-www-form-urlencoded",
      'content-length': content.length
    }
  });
  
  var data;
  req.parseURLEncodedBody(function (body) {
    data = body;
  });
  
  input.sendData(content);
  
  return function () {
    assertMatch({'hello': 'world'}, data);
  }
},

function testParseURLEncodedBodyViaPost() {
  var content = "hello=world"
  var input = mock.createMockInput();
  
  var req = mock.requestFor('POST', '', {
    'input': input,
    'headers': {
      'content-type': "application/x-www-form-urlencoded",
      'content-length': content.length
    }
  });
  
  var data;
  req.post(function (body) {
    data = body;
  });
  
  input.sendData(content);
  
  return function () {
    assertMatch({'hello': 'world'}, data);
  }
}

];

exports.tests.map(function (test) {
  return test();
}).forEach(function (test) {
  process.addListener('exit', function () {
    if (typeof(test) === 'function') {
      test();
    }
  });
});

