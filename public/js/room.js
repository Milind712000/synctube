const socket = io('http://localhost:3000')
const colorForm = document.getElementById('color-form');
const name = prompt("Enter name");


const setColor = (color) => {
    document.body.style.backgroundColor = color;
}

colorForm.onsubmit = (event) => {
    event.preventDefault();
    let colorval = event.target['colorVal'].value;
    socket.emit('change-color', colorval, roomID);
}

socket.emit('initialise', name, roomID);

socket.on('new-color', setColor);

socket.on('new-user', name => {
    console.log(`${name} has joined the room`);
})