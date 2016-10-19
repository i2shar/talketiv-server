const config = require('./config.json');
var app = require('express')();
var port = process.env.PORT || 3000;
app.set('port', (port));

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.txt');
});

app.get('/chat', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/announce/:key', function (req, res) {
    var file = req.params.key + '.' + config.messages.extension;

    io.emit('playSound', config.sounds.default);
    io.emit('playMessage', file);

    res.type("text/plain").send('OK');
});

app.get('/speak/:message/:lang?', function (req, res) {
    var message = req.params.message;
    var language = req.params.lang || 'en';

    io.emit('playSound', config.sounds.default);
    io.emit('speak', {language: language, message: message});
    res.type("text/plain").send('OK');
});

app.get('/speakOnly/:message/:lang?', function (req, res) {
    var message = req.params.message;
    var language = req.params.lang || 'en';

    io.emit('speak', {language: language, message: message});
    res.type("text/plain").send('OK');
});

app.get('/play/:file', function (req, res) {
    var file = req.params.file;
    if (file) {
        io.emit('playSound', file);
    }
    res.type("text/plain").send('OK');
});



io.on('connection', function(socket){
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;

    console.log("client connected: " + socketId + "[" + clientIp + "]");
    socket.on('chat message', function(msg){
        io.emit('chat message', socketId + ": " + msg);
    });
    socket.on('disconnect', function(){
        console.log("client disconnected: " + socketId + "[" + clientIp + "]");
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});