const observation = require("../controllers/observations");

exports.init = (io) => {
  io.sockets.on("connection", (socket) => {
    try {
      /**
       * create or joins a room
       */
      socket.on("create or join", (room, userId) => {
        console.log("Create", room);
        socket.join(room);
      });

      /**
       * send chat messages
       */
      socket.on('chat', (id, username, input) => {
        io.sockets.to(id).emit('chat', id, username, input);
      });

      /**
       * disconnect
       */
      socket.on("disconnect", () => {
        console.log("someone disconnected");
      });
    } catch (e) {}
  });
};
