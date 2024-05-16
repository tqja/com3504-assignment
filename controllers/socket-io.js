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
      socket.on("chat", (chat) => {
        console.log("chat", chat.observationID);
        io.sockets.to(chat.observationID)
            .emit("chat", chat.observationID, chat.username, chat.chat_text);
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
