const observation = require("../controllers/observations");

exports.init = (io) => {
  io.sockets.on("connection", (socket) => {
    try {
      /**
       * create or joins a room
       */
      socket.on("create or join", (room, userId) => {
        socket.join(room);
        console.log("joined room");
      });

      /**
       * send chat messages
       */
      socket.on("chat", (id, username, input) => {
        if (io.sockets.adapter.rooms.has(id)) {
          // Room exists
          console.log("Room exists:", id);
        } else {
          // Room does not exist
          console.log("Room does not exist:", id);
        }
        console.log("Received chat message:", id, username, input);
        io.sockets.to(id).emit("chat", id, username, input);
        console.log("chat fired");
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
