/*
 * Copyright (c) 2016 Internet of Protocols Alliance (IOPA)
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

const should = require('should');

const iopa = require('iopa'),
  iopaConnect = require('../index'),
  http = require('http');

describe('#IOPA()', function () {

  var successServer = 0;
  var server1;

   it('should create an HTTP Listener app', function (done) {

     var app = new iopa.App();
    
      app.use(function(context, next){
          context["iopa.Method"].should.equal("GET");
          context["iopa.Path"].should.equal("/");
          context.response.writeHead(200, {'Content-Type': 'text/html'});
          context.response.end("<html><head></head><body>Hello World from HTTP Server</body></html>");
         
          return next().then(function(){  successServer++;});
            });
      
     server1 =  http.createServer(app.buildHttp()).listen(8000);
      
     
      done();
    
   });
   
    it('should call HTTP server and receive expected result', function (done) {

         var options = {
          host: 'localhost',
          path: '/',
           port: '8000',
          method: 'GET'
        };
        
        var callback = function(response) {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk;
          });
        
          response.on('end', function () {
            str.should.equal("<html><head></head><body>Hello World from HTTP Server</body></html>");
            successServer.should.equal(1);
            server1.close(done);           
          });
        }
        
        var req = http.request(options, callback);
        req.end();
   
    
   });
   
   var IsListening = false;
    it('should create an HTTP Listener app with connect format', function (done) {

     var app = new iopa.App();
    
      app.use(function(req, res){
          req.method.should.equal("GET");
          req.url.should.equal("/");
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end("<html><head></head><body>Hello World from HTTP Server</body></html>");
          successServer++
             });
      
     server1 =  http.createServer(app.buildHttp()).listen(8001);
      IsListening = true;
     
      done();
    
   });
   
    it('should call HTTP server and receive expected result', function (done) {

         var options = {
          host: 'localhost',
          path: '/',
           port: '8001',
          method: 'GET'
        };
        
        var callback = function(response) {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk;
          });
        
          response.on('end', function () {
            str.should.equal("<html><head></head><body>Hello World from HTTP Server</body></html>");
            successServer.should.equal(2);
            server1.close();
            done();            
          });
        }
        if (IsListening)
        {
          var req = http.request(options, callback);
          req.end();
        } else
          throw new Error("test cannot run unless previous test is successful");
    
   });

});
