const express = require("express");
const { createServer } = require("http");
const cors = require("cors")

const mongoClient = require("./database/mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);

const {graphqlHTTP} = require('express-graphql');

const socketio = require("socket.io");
const socketConfig = require("./events/socket");
socketExpressSession = require('socket.io-express-session');

const schema = require('./graphql/schema');
const rootValue = require('./graphql/resolvers/index');

const expressSession = session({
    name:"sid",
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoClient }),
    cookie:{
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,// 7 days
      signed: true,
      sameSite: 'lax'
    }
  });

const app = express();

app.use(cors({
  credentials: true
}));

app.use(
  expressSession
);

app.use('/graphql',
  graphqlHTTP(req => ({
      schema,
      rootValue,
      graphiql: true,
      context: {req}
  }))
);

const server = createServer(app);
const io = socketio(server, {
  cors:true
});

io.use(socketExpressSession(expressSession));

io.on("connection", async function (socket) {
  socketConfig(socket, io);
});


server.listen(process.env.PORT, () => {

  console.log("Server is up on port " + process.env.PORT);
});