const socket = io('http://localhost:3000');
const name = 'lorem ipsum dolor';
socket.emit('initialise', name, roomID);
let player;

function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		videoId: window.room.videoID,
		playerVars: {
			rel : 0
		},
		events: {
			'onReady': onPlayerReady,
			// 'onStateChange': onPlayerStateChange
		}
	});
}

function enableControls() {
	const btnList = document.getElementsByClassName('video-controls');
	for (let i = 0; i < btnList.length; i++) {
		btnList[i].disabled = false;
	}
}

function playVideo() {
	player.playVideo();
	socket.emit('send-play', roomID);
}

function pauseVideo() {
	player.pauseVideo();
	socket.emit('send-pause', roomID);
}

function syncVideo() {
	const stamp = player.getCurrentTime();
	socket.emit('send-sync', roomID, stamp);
}

function onPlayerReady() {
	enableControls()
}

function syncToTime(stamp) {
	player.pauseVideo();
	player.seekTo(stamp, true);
	player.playVideo();
}

socket.on('video-play', () => {
	player.playVideo();
})

socket.on('video-pause', () => {
	player.pauseVideo();
})

socket.on('video-sync', (stamp) => {
	syncToTime(stamp);
})
