const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {isURL, getVideoID} = require('./helper/urlHelper');

app.set('views', './views')
app.set('view engine', 'ejs')
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }))

const rooms = {}

const handleDisconnection = (userID) => {
	const now = Date.now();
	for(const roomID in rooms){
		delete rooms[roomID].users[userID];
	}
	for(const roomID in rooms){
		if(
			Object.keys(rooms[roomID].users).length === 0
			&&
			now - rooms[roomID].toc > 300000
		){
			delete rooms[roomID];
		}
	}
}

app.get('/', (req, res) => {
	res.render('index');
})

app.post('/createRoom', (req, res) => {
	const {video, name} = req.body;
	let videoID;
	if(isURL(video)){
		videoID = getVideoID(video);
	}else{
		return res.status(400).send("Invalid video Link");
	}
	if(video && name){
		if(rooms[name]){
			res.status(400).send({error : `The name ${name} is taken`});
		} else {
			rooms[name] = {
				videoID, // video url
				toc : Date.now(), // time of creation
				users : {}
			};
			res.send({msg : 'successful'})
		}
	}else{
		res.status(400).send({error : `video url and room name cannot be empty`});
	}
})

app.post('/joinRoom', (req, res) => {
	const {name} = req.body;
	if(name && rooms[name]) res.redirect(`/room/${req.body.name}`);
	else res.send("room does not exist");
})

app.get('/getRooms', (req, res) => {
	res.send(rooms);
})

app.get('/room/:roomID', (req, res) => {
	const roomID = req.params.roomID
	res.render('videoRoom', {room : rooms[roomID], roomID })
})

io.on('connection', socket => {
	console.log(`${socket.id} has connected`);

	socket.on('initialise', (name, roomID) => {
		socket.join(roomID);
		socket.to(roomID).broadcast.emit('new-user', name);
	})

	socket.on('send-play', (roomID) => {
		io.to(roomID).emit('video-play');
	})

	socket.on('send-pause', (roomID) => {
		io.to(roomID).emit('video-pause');
	})

	socket.on('send-sync', (roomID, stamp) => {
		io.to(roomID).emit('video-sync', stamp);
	})

	socket.on('disconnect', () => {
		console.log(`${socket.id} has disconnected`);
		handleDisconnection(socket.id);
	})

	socket.on('change-color', (color, roomID) => {
		io.to(roomID).emit('new-color', color);
	})
})


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`started listening on port : ${PORT}`);
});
