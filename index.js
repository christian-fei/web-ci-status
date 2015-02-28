var express = require('express')
  , bodyParser = require('body-parser')
  , morgan = require('morgan')
  , net = require('net')
  , JSONSocket = require('json-socket')
  , bunyan = require('bunyan')
  , bunyanFormat = require('bunyan-format')  
  , log = bunyan.createLogger({name: 'WEB_CI_STATUS', stream: bunyanFormat({ outputMode: 'short' })})

log.info('test')

var WEB_CI_STATUS_HTTP_PORT = process.env.WEB_CI_STATUS_HTTP_PORT || 3003
var WEBHOOK_PUBLISHER_TCP_COMM_HOST = process.env.WEBHOOK_PUBLISHER_TCP_COMM_HOST || '146.185.167.197'
var WEBHOOK_PUBLISHER_TCP_COMM_PORT = process.env.WEBHOOK_PUBLISHER_TCP_COMM_PORT || 3002

var app = express()
var tcpSocket = new net.Socket()

app.use(bodyParser.json())
app.use(morgan('combined'))

app.get('/', function(req, res){
  res.send('Hello World!')
})

var httpServer = app.listen(WEB_CI_STATUS_HTTP_PORT, function(){
  var port = httpServer.address().port
  log.info('HTTP server listening at http://localhost:%s', port)
})

tcpSocket.connect(WEBHOOK_PUBLISHER_TCP_COMM_PORT, WEBHOOK_PUBLISHER_TCP_COMM_HOST, function(){
  log.info('TCP server listening on http://localhost:' + WEBHOOK_PUBLISHER_TCP_COMM_PORT)
})
.on('error', function(){
  log.error('TCP server failed to connect')
  process.exit(1)
})
.on('connection',function(socket){
  var name = socket.remoteAddress + ':' + socket.remotePort + ':' + socket._handle.fd
  socket = new JSONSocket(socket)
  socket.name = name
  socket.on('message', function(){
    log.info('test')
  })
})