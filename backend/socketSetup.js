module.exports = (httpServer) => {
    const { Server } = require('socket.io');
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
  
    return io;
  };