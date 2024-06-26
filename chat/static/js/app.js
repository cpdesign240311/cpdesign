const express = require('express')
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')
const app = express()
const server = http.createServer(app)
const io = socket(server)

// chatApp.js와 chatApp.css 있는 부분으로 매핑
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

// readFile에서 chatApp.html이 있는 부분으로 매핑
app.get('/', function(request, response) {
  fs.readFile('chatApp.html', function(err, data) {
    if(err) {
      response.send('페이지를 찾을 수 없습니다. - 주소 매핑 확인 필요')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})

io.sockets.on('connection', function(socket) {
  socket.on('newUser', function(name) {
    socket.name = name
  })

  socket.on('message', function(data) {
    data.name = socket.name
    console.log(data)
    socket.broadcast.emit('update', data);
  })
})

server.listen(2020, function() {
  console.log('채팅 서버 실행 중..')
})
