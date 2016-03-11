/*
 * Copyright (c) 2015 Internet of Protocols Alliance (IOPA)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const iopa = require('iopa'),
  iopaConnect = require('./index'),
  http = require('http');

var app = new iopa.App();

// use IOPA and connect format interchangeably [IOPA]
app.use(function (context, next) {
  console.log("HELLO FROM IOPA " + context["iopa.Path"]);
  context.response.writeHead(200, { 'Content-Type': 'text/html' });
  context.response.end("<html><head></head><body>Hello World from HTTP Server</body></html>");
  return next();
});
    
// Use IOPA and CONNECT format interchangeably  [CONNECT]
app.use(function (req, res) {
  console.log("HELLO FROM CONNECT " + req.url);
});

http.createServer(app.buildHttp()).listen(8000);

app.log.info("HTTP Server running at http://localhost:8000/");