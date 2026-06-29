const jwt = require("jsonwebtoken");
const cookie = require("cookie");

let io;

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined personal room`);
      }
    });
    
   
    socket.on('join:classrooms', (classroomIds) => {
      if (classroomIds && classroomIds.length) {
        classroomIds.forEach(id => {
          socket.join(`classroom:${id}`);
          console.log(`Socket ${socket.id} joined classroom ${id}`);
        });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

const notifyUser = (userId, notification) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

const notifyClassroom = (classroomId, notification, excludeUserId = null) => {
  if (!io) return;
  const target = io.to(`classroom:${classroomId}`);
  target.emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};


// for admins (later)
// const notifyRole = (role, notification) => {
//   if (!io) return;
//   io.to(`role:${role}`).emit('notification', {
//     ...notification,
//     timestamp: new Date().toISOString(),
//   });
// };

module.exports = { initSocket, notifyUser, notifyClassroom };