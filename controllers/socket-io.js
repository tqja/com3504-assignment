const observation = require('../controllers/observations')
exports.init = (io) => {
    io.sockets.on('connection', (socket) => {
        try {
            /**
             * create or joins a room
             */
            socket.on('create or join', (room, userId) => {
                socket.join(room);
                io.sockets.to(room).emit('joined', room, userId)
            })

            /**
             * send chat messages
             */
            socket.on('chat', (room, userId, chatText) => {
                io.sockets.to(room).emit('chat', room, userId, chatText)

                // Update chat history in MongoDB
                let chatDetails = {
                    'observation_id': room,
                    'chat_username': userId,
                    'chat_text': chatText
                }

                observation.observation_update_chat_history(chatDetails)
            })

            /**
             * disconnect
             */
            socket.on('disconnect', () => {
                console.log('someone disconnected')
            })

        } catch (e) {
        }
    })
}