const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const session = require("express-session"); //npm i express-session
const KnexStore = require("connect-session-knex")(session); //remember to curry and pass the session

const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");
const restricted = require("./auth/restricted-middleware");
const knex = require("./data/dbConfig"); // needed for storing session in the database

const server = express();

const sessionConfig = {
  name: "monster",
  secret: "keep it secret, keep it safe!",
  resave: true,
  saveUninitialized: true, // reladed to GDPR compliance
  cookie: {
    maxAge: 1000 * 60 * 10, //it's in miniseconds, 1000 to  one second times 60 time 10 to get 10 min
    secure: false, // should be true in production
    httpOnly: true, //true means JS can't touch the cookie
  },
  //remember the new keyword
  store: new KnexStore({
    knex,
    tablename: "sessions",
    createtable: true, //if there is no table in databease it will create it
    sidfieldname: "sid",
    clearInterval: 1000 * 60 * 15, //to clear the database after 15 min
  }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig)); //to add sessions to log in, turn on the session midleware
// at this poin there is a req.session object created by express-session

server.use("/api/auth", authRouter);
server.use("/api/users", restricted, usersRouter);

server.get("/", (req, res) => {
  console.log(req.session);
  res.json({ api: "up" });
});

module.exports = server;
