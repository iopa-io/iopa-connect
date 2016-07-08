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

const iopa = require('iopa'),
    http = require('http'),
    constants = iopa.constants,
    IOPA = constants.IOPA,
    SERVER = constants.SERVER


function HttpServer(app) {
    this._app = app;
    app.createServer = this.createServer_.bind(this, app.createServer || function () { throw new Error("no registered transport provider"); });
}

HttpServer.prototype.createServer_ = function HttpServer_createServer(next, scheme, options) {
    if (scheme != "http:")
        return next(scheme, options)

    options = options || {};

    var server = {};
    server._http = http.createServer(this._app.buildHttp());
    server.listen = this.listen_.bind(this, server);
    server.close = this.close_.bind(this, server);

    return server;
};

HttpServer.prototype.listen_ = function HttpServer_listen(server, options) {
    var port = options.port || 0;
    var address = options.address || '0.0.0.0';

    server.port = port;
    server.address = address;

    return new Promise(function (resolve, reject) {
        server._http.listen(server.port, server.address,
            function () {
                var linfo = server._http.address();
                server.port = linfo.port;
                server.address = linfo.address;
                resolve(server);
            });
    });
}


HttpServer.prototype.close_ = function HttpServer_close() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            server._http.close()
            server._http = undefined;
            server = null;
            resolve(null);
        }, 200)
    });
}

exports.default = HttpServer;