require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require("path");
const cookieParser = require('cookie-parser');
const http = require('http');    
const { Server } = require('socket.io'); 
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware.js');
const { initSocket } = require('./config/socket'); 

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require("./routes/uploadRoutes.js");
const adminRoutes = require("./routes/adminRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const announcementRoutes = require("./routes/announcementRoutes")
const quizRoutes = require("./routes/quizRoutes");
const quizGenerator = require("./routes/quizGenerator");
const summarizationRouter = require("./routes/summarizationRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const sttRouter = require("./routes/speechToText"); 


connectDB();

const app = express();
const server = http.createServer(app);    

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  }
});

app.set('io', io);
initSocket(io);


app.use(cookieParser());

app.use(helmet());

// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//     },
//   },
// }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Specific origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH' ,'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "uploads")));

app.use("/api/uploads", uploadRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/assignments", assignmentRoutes)
app.use("/api/announcements",announcementRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/generate-quiz", quizGenerator);
app.use("/api/generate-summary", summarizationRouter);
app.use('/api/notifications', notificationRoutes);

app.use("/api/speech-to-text", sttRouter);


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});



// app.use('/api/*', (req, res, next) => {
//   res.status(404).json({
//     success: false,
//     error: 'API endpoint not found',
//     path: req.originalUrl,
//     method: req.method,
//     timestamp: new Date().toISOString(),
//     suggestion: 'Check /api/docs for available endpoints'
//   });
// });


//should be last
app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;