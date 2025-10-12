import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
const { session: _session } = passport;
import MongoStore from "connect-mongo";
import userRoutes from "./routes/user.js";
import cors from "cors";
import pkg from "passport-local";
const local_auth = pkg.Strategy;
import session from "express-session";
import User from "./models/user.js";
import initSocket from "./utils/socket.js";
import http from "http";
import { Server } from "socket.io";
import message from "./models/message.js";
import messageRoutes from "./routes/message.js";
const { connect, connection } = mongoose;
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/auth";
connect(dbUrl);

const db = connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
const server = http.createServer(app);

const secret = process.env.SECRET;

const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // lazy update
  }),
  name: "session",
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new local_auth(User.authenticate()));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.LOCAL_FRONTEND_URL],
    credentials: true, // Allow cookies / sessions
  }),
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.LOCAL_FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Share session with Socket.IO
const sessionMiddleware = session(sessionConfig);
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Helper to get user from session (Passport)
const getUserFromSession = (req) => req.session?.passport?.user;

// Initialize socket logic
initSocket(io, getUserFromSession);
app.use((req, res, next) => {
  next();
});

app.use("/user", userRoutes);
app.use("/messages", messageRoutes);

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";
server.listen(PORT, HOST, () => console.log(`Server running on port ${PORT}`));
