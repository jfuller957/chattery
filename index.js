const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const nicknames = [];

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function(socket) {
  socket.on("new user", function(data, callback) {
    if (nicknames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      updateNicknames();
    }
  });

  function updateNicknames() {
    io.sockets.emit("usernames", nicknames);
  }

  socket.on("disconnect", function() {
    io.emit("chat message", "A user has connected!");
  });

  socket.on("disconnect", function() {
    if (!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    updateNicknames();
    io.emit("chat message", "A user has disconnected!");
  });

  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
