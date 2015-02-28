var express = require('express')
  , socketIO = require('socket.io')
  , bodyParser = require('body-parser')
  , morgan = require('morgan')
  , net = require('net')
  , JSONSocket = require('json-socket')
  , bunyan = require('bunyan')
  , bunyanFormat = require('bunyan-format')  
  , log = bunyan.createLogger({name: 'WEB_CI_STATUS', stream: bunyanFormat({ outputMode: 'short' })})

var WEB_CI_STATUS_HTTP_PORT = process.env.WEB_CI_STATUS_HTTP_PORT || 3002
var WEBHOOK_PUBLISHER_TCP_HOST = process.env.WEBHOOK_PUBLISHER_TCP_HOST || '146.185.167.197'
var WEBHOOK_PUBLISHER_TCP_PORT = process.env.WEBHOOK_PUBLISHER_TCP_PORT || 3001

var app = express()

app.use(express.static(__dirname + '/www'));
app.get('/', function(req,res){
  res.sendFile(__dirname + '/www/index.html')
});
var httpServer = app.listen(WEB_CI_STATUS_HTTP_PORT, function(){
  var port = httpServer.address().port
  log.info('HTTP server listening at http://localhost:%s', port)
})
var io = socketIO.listen(httpServer)
var tcpSocket = new JSONSocket(new net.Socket())

app.use(bodyParser.json())
app.use(morgan('combined'))

app.get('/', function(req, res){
  res.send('Hello World!')
})


tcpSocket.connect(WEBHOOK_PUBLISHER_TCP_PORT, WEBHOOK_PUBLISHER_TCP_HOST, function(){
  log.info('TCP COMM client connected to http://localhost:%s', WEBHOOK_PUBLISHER_TCP_PORT)
})
tcpSocket.on('error', function(){
  log.error('TCP client failed to connect')
  process.exit(1)
})
tcpSocket.on('message', function(data){
  log.info(data)
  io.sockets.emit('ci-status', data)
})