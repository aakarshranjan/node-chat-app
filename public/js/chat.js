const socket = io()

//Elements
const $messageForm = document.querySelector('#f1')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messageDiv = document.querySelector('#messageDiv')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messageDiv.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messageDiv.offsetHeight

    const containerHeight = $messageDiv.scrollHeight

    const scrollOffset = $messageDiv.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messageDiv.scrollTop = $messageDiv.scrollHeight
    }
}

socket.on('sendMessage',(msg)=>{
    const html = Mustache.render($messageTemplate, {
        username:msg.username,
        mes1: msg.text,
        time:moment(msg.createdAt).format('h:mm a')
    })
    $messageDiv.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('sendLocation',(loc)=>{
    const html = Mustache.render($locationTemplate, {
        username:loc.username,
        loc1:loc.loc,
        time:moment(loc.createdAt).format('h:mm a')
    })
    $messageDiv.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('RoomData', ({room,users})=>{
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    socket.emit('recvMessage', $messageFormInput.value, (profaneMsg)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(profaneMsg){
            return console.log(profaneMsg)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        pos={
            lat:position.coords.latitude,
            long:position.coords.longitude
        }
        socket.emit('location',pos,()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})