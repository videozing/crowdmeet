const morgan = require("morgan");
const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
  res.status(200);
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, { id, name = uuidV4() }) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", { id, name });

    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", { id, name });
    });
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

server.listen(port, () => console.log("Server is running on port Successfully !"));
