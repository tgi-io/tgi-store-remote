/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/spec/node-runner.js
 */

// Initialize connect
var connect = require('connect');
var app = connect();
app.use(connect.static('.'));
app.use(connect.directory('.', {icons: true}));

var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
var k,k2;
for (k in interfaces) {
  for (k2 in interfaces[k]) {
    var address = interfaces[k][k2];
    if (address.family == 'IPv4' && !address.internal) {
      addresses.push(address.address)
    }
  }
}

// Start up HTTP server (http)
var IP = addresses[0];
var Port = 8080;
var http = require('http').createServer(app);
var server = http.listen(Port, function () {
  console.log('Paste this in your browser and smoke it:\n' +
  'http://' + IP + ':' + Port + '/spec/html-runner.html');
});


// Start up Socket Server (io)
var Connections = []; // Array of connections
var io = require('socket.io').listen(server);