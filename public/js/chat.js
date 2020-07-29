// Connect to server with socket.io
const socket = io();
const form = document.getElementById('msgForm');
const userInput = document.getElementById('userMsg');
const submitMsg = document.getElementById('submitMsg');
const locationBtn = document.getElementById('locationBtn');
const msgContainer = document.getElementById('messages');
const sidebar = document.getElementById('sidebar');


// Templates
const msgTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('link-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

const autoscroll = () => {
    // new message element
    const newMsg = msgContainer.lastElementChild

    // get the height of the last message new message
    const newMsgStyles = getComputedStyle(newMsg)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    // add bottom margin to the height of the new last message
    const newMsgHeight = newMsg.offsetHeight + newMsgMargin

    // get visible height
    const visibleHeight = msgContainer.offsetHeight

    // get height of messages container ('scrollHeight' returns the total height we are able to scroll through)
    const containerHeight = msgContainer.scrollHeight

    // How far have I scrolled from the top?
    const scrollOffset = msgContainer.scrollTop + visibleHeight

    // Check that we were at the bottom before the last new message was added
    if (containerHeight - newMsgHeight <= scrollOffset) {
        // set value for how far down we are scrolled, which here, is all the way down
        msgContainer.scrollTop = msgContainer.scrollHeight
    }
}

// Options
// Use QueryString to put the query string into an object. For example: 'username' from query will be will be {username: 'nameofuserinquery'}
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitMsg.setAttribute('disabled', 'disabled')
    // whenever you emit an event and want to use "Acknowledgement", you pass a function as the last argument in 'emit'.
    // Whoever is emiting the event, sets up a callback function. Whoever receives the event receives a callback function that it needs to call.
    // In this case we emit this event to the server. The server calls the callback function in the 'sendMsg' event.
    socket.emit('sendMsg', userInput.value, (badWordError) => {
        submitMsg.removeAttribute('disabled')
        userInput.value = ''
        userInput.focus()
        if (badWordError) {
            return console.log(badWordError)
        }
        console.log('Message was delivered successfully')
    })
})

locationBtn.addEventListener('click', (event) => {
    event.preventDefault()
    locationBtn.setAttribute('disabled', 'disabled')

    //check if browser supports 'navigator.geolocation'
    if(!navigator.geolocation) {
        return alert("Your current browser does not support the Geolocation service")
    }
    navigator.geolocation.getCurrentPosition( (location) => {
        const { latitude = {}, longitude = {} } = location.coords
        socket.emit('shareLocation', latitude, longitude, () => {
            locationBtn.removeAttribute('disabled')
        })
        // console.log("latitude: " + latitude + "\n" + "longitude: " + longitude)
    });
})

socket.on('eventMsg', (message) => {
    // Provide data to Mustache for it to render, in the second argument, which is an object
    const html = Mustache.render(msgTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("ddd, HH:mm - GGGG")
    })
    msgContainer.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('showLocation', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        link: location.url,
        createdAt: moment(location.createdAt).format("ddd, HH:mm - GGGG")
    })
    msgContainer.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomInfo', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
    
    // Grab button here because it isn't rendered before Mustache has rendered the template
    const myLin = document.getElementById('leave__btn');
    myLin.addEventListener('click', () => {
        location.href="/"
    })
})

socket.emit('joinRoom', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href="/"
    }
})

