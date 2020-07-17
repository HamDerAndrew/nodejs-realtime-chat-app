// Connect to server with socket.io
const socket = io();
const form = document.getElementById('msgForm');
const userInput = document.getElementById('userMsg');
const locationBtn = document.getElementById('locationBtn');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.emit('sendMsg', userInput.value)
})

locationBtn.addEventListener('click', (event) => {
    event.preventDefault()

    //check if browser supports 'navigator.geolocation'
    if(!navigator.geolocation) {
        return alert("Your current browser does not support the Geolocation service")
    }
    navigator.geolocation.getCurrentPosition( (location) => {
        const { latitude = {}, longitude = {} } = location.coords
        console.log("latitude: " + latitude + "\n" + "longitide: " + longitude)
        socket.emit('shareLocation', latitude, longitude)
    });
})

socket.on('eventMsg', (message) => {
    console.log(message)
})

socket.on('sendMsg', (message) => {
    console.log(message)
})

socket.on('showLocation', (message) => {
    console.log(message)
})