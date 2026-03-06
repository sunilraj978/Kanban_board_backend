const express = require("express");
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");

const socketHandler = require("./socketHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
 res.send("Kanban backend running");
});

const server = http.createServer(app);

const io = new Server(server,{
 cors:{origin:"*"}
});

socketHandler(io);

server.listen(4000,()=>{
 console.log("Server running on port 4000");
});