import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
// const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0"; // "0.0.0.0" works for cloud deployments
// const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const roomsMeta = new Map();
let pendingErrors;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("send error", (message) => {
      pendingErrors = message;
    });

    socket.on("request error", () => {
      socket.emit("request error", pendingErrors);
      pendingErrors = null;
    })

    socket.on("request rooms", () => {
      const rooms = io.sockets.adapter.rooms;
      let customRooms = [];
      for (let [roomName, room] of rooms) {
        // If the room name matches a socket ID, skip it
        if (io.sockets.sockets.get(roomName)) continue;

        customRooms.push(roomName);
      }

      console.log(customRooms);

      socket.emit("send rooms", customRooms);
    });

    socket.on("room creation", (roomName) => {
      const rooms = io.sockets.adapter.rooms;
      let customRooms = [];
      let roomSizes = [];

      for (let [roomName, room] of rooms) {
        // If the room name matches a socket ID, skip it
        if (io.sockets.sockets.get(roomName)) continue;

        customRooms.push(roomName);
        roomSizes.push(io.sockets.adapter.rooms.get(roomName).size);
      }

      console.log(customRooms, roomSizes);
      if (customRooms.includes(roomName)) {
        socket.emit("room name taken");
        return;
      } else {
        socket.emit("room made successfully");
      }

      socket.join(roomName);

      roomsMeta.set(roomName, {
        host: socket.id,
        guest: null,
        ready: [],
        winner: null,
        loser: null,
        winningScore: 0,
        losingScore: 0,
      });

      console.log('rooms you are in (creating)', socket.rooms);
    });

    socket.on("request room full", (slug) => {
      const room = io.sockets.adapter.rooms.get(slug);
      // console.log('room ', room)
      console.log(io.sockets.adapter.rooms, slug);
      console.log('room size', room.size);

      let roomFull;
      if (!room) {
        roomFull = null;
      } else if (room.size > 2) {
        // room size is compared after room has been joined (room.size = 1 during new room, etc.)
        roomFull = true;
      } else if (room.size <= 2) {
        roomFull = false;
      }
      console.log(roomFull);
      socket.emit("receive room full", roomFull);
    });

    socket.on("request room members", (slug) => {
      const room = io.sockets.adapter.rooms.get(slug);
      socket.emit("return room members", Array.from(room));
    });

    socket.on("request room join", async (roomName) => {
      console.log("request for room join received");
      console.log('rooms you are in (joining)', socket.rooms);
      const room = io.sockets.adapter.rooms.get(roomName);
      const roomMeta = roomsMeta.get(roomName);
      console.log(roomMeta);

      if (room && room.size < 2 && roomMeta && roomMeta.ready.length != 2) {
        console.log("join room success");
        await socket.join(roomName);
        socket.emit("join room", "successful");
        socket.to(roomName).emit("start game");

        const roomMeta = roomsMeta.get(roomName); // Assign meta data
        roomMeta.guest = socket.id;
      } else {
        console.log("join room failed");
        socket.emit("join room", "failure");
      }
    });

    socket.on("request room leave", (roomName) => {
      socket.leave(roomName);

      // Meta information

      const roomMeta = roomsMeta.get(roomName);

      if (roomMeta.host == socket.id) {
        roomMeta.host = roomMeta.guest; // make the guest the new host
        roomMeta.guest = null;
      }
      if (roomMeta.guest == socket.id) roomMeta.guest = null;

      if (!roomMeta.guest && !roomMeta.host) {
        // delete room if both players aren't in it
        roomsMeta.delete(roomName);
      }
    });

    socket.on("leave all rooms", () => {
      const roomsToLeave = Array.from(socket.rooms).filter(
        (r) => r !== socket.id
      );
      console.log("rooms to leave");
      for (const room of roomsToLeave) {
        socket.leave(room);
      }
    });

    socket.on("get game role", (roomName) => {
      const roomMeta = roomsMeta.get(roomName);

      if (roomMeta.host == socket.id) {
        socket.emit("receive game role", "host");
      } else if (roomMeta.guest == socket.id) {
        socket.emit("receive game role", "guest");
      }
    });

    socket.on("player ready", (roomName) => {
      const room = roomsMeta.get(roomName);

      room.ready.push(socket.id);

      if (room.ready.length == 2) {
        socket.to(roomName).emit("both players ready");
      }
    });

    socket.on("send current cards", (cardList, roomName) => {
      socket.to(roomName).emit("receive current cards", cardList);
    });

    // socket.on("correct answer", (roomName, userID) => {

    // });

    socket.on("send current score", (score, roomName, userID) => {
      socket.to(roomName).emit("receive opponent score", score, userID); // send userID to track player and opponent
    });

    socket.on("game finished", (roomName, result, userID, pointsScored) => {
      const room = roomsMeta.get(roomName);
      if (result == "win") {
        room.winner = userID;
        console.log("winning score updated");
        room.winningScore = pointsScored;
      } else if (result == "loss") {
        room.loser = userID;
        console.log("losing score updated");
        room.losingScore = pointsScored;
      }
    });

    socket.on("get game results", (roomName, userID) => {
      const room = roomsMeta.get(roomName);
      if (room.winner == null || room.loser == null) {
        console.log("no winner");
        socket.emit("get game results", null, null);
      } else if (room.winner == userID) {
        console.log("you win", room.winningScore);
        socket.emit("get game results", "win", room.winningScore);
      } else if (room.loser == userID) {
        console.log("you lost", room.losingScore);
        socket.emit("get game results", "loss", room.losingScore);
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
