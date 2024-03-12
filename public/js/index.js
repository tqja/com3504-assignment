let chatId = null

//(idea) username needs to be checked and used in the chat room as the chat name asw
let visitorUsername = null

const socket = io()
/**
 * initialises the chat interface with the socket messages
 */
const initChat = () => {

    // print chat history stored in MongoDB
    let messagesStr = document.getElementById('messages').textContent
    let messages = JSON.parse(messagesStr)

    messages.forEach((message) => {
        let chat_username = message.chat_username
        let chat_text = message.chat_text
        writeOnHistory('<b>'+chat_username+'</b>' + ' ' + chat_text)
    })

    // called when someone joins the room
    socket.on('joined', (room, userId) => {
        // notifies that someone has joined the room
        writeOnHistory('<b>'+userId+'</b>' + ' joined the chat')
    })

    // called when a message is received
    socket.on('chat', (room, userId, chatText) => {
        writeOnHistory('<b>' + userId + ':</b> ' + chatText)
    })
}

/**
 * used to connect to a chat room.
 */
const connectToRoom = () => {
    chatId = document.getElementById('chatId').innerHTML
    socket.emit('create or join', chatId, visitorUsername)
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via socket
 */
const sendChatText = () => {
    let chatText = document.getElementById('chat_input').value
    socket.emit('chat', chatId, visitorUsername, chatText)
}
