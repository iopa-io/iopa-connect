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
 
 var CONNECT = {
    socket : null,
    connection : null,
    httpVersion : null,
    httpVersionMajor : null,
    httpVersionMinor : null,
    originalUrl : null,
    url : null,
    complete: null,
    headers: null,
    rawHeaders: null,
    trailers: null,
    rawTrailers: null,
    readable: null,
    method: null, 
    statusCode: null,
    statusMessage: null,
    headersSent: null,
    sendDate: null,
    status: null,
    writeContinue: null,
    setTimeout: null,
    addTrailers: null,
    setHeader: null,
    getHeader: null,
    removeHeader: null,
    writeHead: null, 
    end: null,
    write: null,   
} 

 
var CONNECT_REQ = {
    socket : null,
    connection : null,
    httpVersion : null,
    httpVersionMajor : null,
    httpVersionMinor : null,
    originalUrl : null,
    url : null,
    complete: null,
    headers: null,
    rawHeaders: null,
    trailers: null,
    rawTrailers: null,
    readable: null,
    method: null, 
    getHeader: null
} 

var CONNECT_RES = {
    socket: null, 
    connection: null, 
    statusCode: null,
    statusMessage: null,
    headersSent: null,
    sendDate: null,
    status: null,
    writeContinue: null,
    setTimeout: null,
    addTrailers: null,
    setHeader: null,
    getHeader: null,
    removeHeader: null,
    writeHead: null, 
    end: null,
    write: null,     
};

_mirrorValues(CONNECT_REQ);
_mirrorValues(CONNECT_RES);
_mirrorValues(CONNECT);

exports.CONNECT_REQ = CONNECT_REQ;
exports.CONNECT_RES = CONNECT_RES;
exports.CONNECT = CONNECT;

function _mirrorValues(obj) {
   for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = key;
    }
  }
};

exports.HTTP = {
    "100": "Continue",
    "101": "Switching Protocols",
    "102": "Processing",
    "200": "OK",
    "201": "Created",
    "202": "Accepted",
    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "207": "Multi-Status",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "307": "Temporary Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Payload Too Large",
    "414": "URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Range Not Satisfiable",
    "417": "Expectation Failed",
    "422": "Unprocessable Entity",
    "423": "Locked",
    "424": "Failed Dependency",
    "426": "Upgrade Required",
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "431": "Request Header Fields Too Large",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Time-out",
    "505": "HTTP Version Not Supported",
    "507": "Insufficient Storage",
    "511": "Network Authentication Required"
};

exports.IOPA_CONNECT = {CAPABILITY: "urn:io.iopa:legacy", 
    expanded: "legacy.expanded",
    req: "req",
    res: "res", 
    reqres: "reqres"}