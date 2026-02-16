let ioInstance = null;

function init(server, opts = {}) {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, { cors: { origin: '*', methods: ['GET','POST'] }, ...(opts||{}) });
  ioInstance.on('connection', (socket) => {
    // simple log
  });
  return ioInstance;
}

function io() {
  if (!ioInstance) throw new Error('io not initialized');
  return ioInstance;
}

module.exports = { init, io };
