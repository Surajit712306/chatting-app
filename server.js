const path = require('path');
const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;
app.set('port', PORT);

io.use((socket, next)=> {
    next();
});

const users = {};

io.on('connection', socket => {
    console.log(`Socket ${socket.id} is connected.`);

    socket.on('user-connected', user => {
        users[socket.id] = user;
        socket.broadcast.emit("user-connected", user);
    });
    
    socket.on("send-message", message => {
        socket.broadcast.emit("receive-message", message);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
        console.log(`Socket ${socket.id} is disconnected.`);
    });

});

//set the security
app.disable('x-powered-by');
app.set('trust-proxy', 1);



//server the static file
app.use('/', express.static(path.join(__dirname,'static')));

//get the roueter
const router = express.Router();
app.use('/', router);

router.get('/socket', (req,res) => {
    res.send('Hello websocket');
});

router.all("*", (req,res) => {
    res.redirect('/');
});

server.listen(app.get('port'), () => {
    console.log(`Server is running at http://localhost:${app.get('port')}.`);
});

server.on('error', err => {
    console.log(`Server error: ${err.message}`);
});

