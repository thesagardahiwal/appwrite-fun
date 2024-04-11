import { Client } from 'node-appwrite';

import express from "express";
import http from "http";
import {Server} from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Welcome to Node")
})

const io = new Server(server, 
    {cors: 
        {origin: "http://localhost:5173", 
            methods: ["GET", "POST"], 
            credentials: true
        }
    }
);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
  socket.on("create-room", (data) => {
    const {id, username, userId} = data;
    socket.join(id);
    io.to(id).emit("room-chat", 
      {roomId: id, username: username, userId: userId}
    );
    io.to(id).emit("welcome-msg", {message: "🎊 Room is created successfully 🎊"});
  });
  socket.on("join-room", (data) => {
    const {roomId, username} = data;
    socket.join(roomId);
    socket.emit("isJoined", {Id: socket.id, roomId: roomId});
    socket.broadcast.to(roomId).emit("member-joined", {username: username});
  });
  socket.on("call-members", (data) => {
    const {roomId, username} = data;
    socket.join(roomId);
    io.to(roomId).emit("recieve-member", username);
  });
  socket.on("get-username", (data) => {
    const {id} = data;
    io.to(id).emit("recieve-username", "Avtar" )
  });
  socket.on("group-message", (data) => {
    const {message, id, username, roomId, time} = data;
    socket.join(roomId);
    io.to(roomId).emit('group-mess', 
      {message: message, id: id, username: username, time: time}
    );
  });
  socket.on("share-file", (data) => {
    const {filename, roomId} = data;
    socket.join(roomId);
    console.log("File Shared!")
    io.to(roomId).emit("media-file", "New File shared!");
  });
  // AI - CHAT
  socket.on("ai-chat", (data) => {
    const {message, id, username, roomId, time} = data;
    socket.join(roomId);
    io.to(roomId).emit("message-with-ai", 
      {message: message, id: id, username: username, time: time}
    );
  });
  socket.on("logout", (data) => {
    console.log("Logout Request:", data);
  });
  // 
  socket.on("kickout", (data) => {
    console.log("kickout- Listner");
    const {roomId, user} = data;
    io.to(roomId).emit("kickout", {username: user});
  });
  // Peer Connection
  socket.on("join-screen", (data) => {
    const {id, roomId} = data;
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("new-user-connection", id);
  });
  socket.on("calling", (data) => {
    const {roomId, username} = data;
    socket.join(roomId);
    socket.to(roomId).emit("on-call", username);
  });
  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);
  });
});

export default server;

// This is your Appwrite function
// It's executed each time we get a request
// export default async ({ req, res, log, error }) => {
  // Why not try the Appwrite SDK?
  //
  // const client = new Client()
  //    .setEndpoint('https://cloud.appwrite.io/v1')
  //    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  //    .setKey(process.env.APPWRITE_API_KEY);

  // You can log messages to the console
  // log('Hello, Logs!');

  // If something goes wrong, log an error
  // error('Hello, Errors!');

  // The `req` object contains the request data
  // if (req.method === 'GET') {
  //   app.get("/", (req, res) => {
  //     res.send("Welcome to Node")
  //   })
    // Send a response with the res object helpers
    // `res.send()` dispatches a string back to the client
    // return res.send('Hello, World!');
  // }

  // `res.json()` is a handy helper for sending JSON
  // return res.json({
  //   motto: 'Build like a team of hundreds_',
  //   learn: 'https://appwrite.io/docs',
  //   connect: 'https://appwrite.io/discord',
  //   getInspired: 'https://builtwith.appwrite.io',
  // });
// };
