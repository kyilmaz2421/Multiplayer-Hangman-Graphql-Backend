const socketio = require("socket.io");
const User = require("../models/user");
const Game = require("../models/game");


const checkWin = (correct, wrong, word) => {
  let status = 'win';

  // Check for win
  word.split('').forEach(letter => {
    if(!correct.includes(letter)){
      status = '';
    }
  });
  
  // Check for lose
  if(wrong.length === 6) status = 'lose';

  return status
}

const socketConfig = async (socket, io) => {
  console.log(socket.id,socket.handshake.session.userdata);

  socket.on("join", async ({username}) => {
      console.log("join",socket.id, username)
      socket.join(username);
  });

  socket.on("disconnect", async ({username}) => {
      console.log("disconnect",socket.id,username,socket.handshake.session.userdata)
      socket.leave(username);
      socket.disconnect();
  });



  socket.on('trigger-lobby-removal',({hostName, userToRemove, senderSocketLeaveTo })=>{
    console.log("REMOVE")
    socket.to(hostName).emit("remove-from-lobby", {hostName, userToRemove});
    if(senderSocketLeaveTo) socket.leave("lobby:"+hostName);
  })

  socket.on('send-invitation', async ({invitation}, callback)=>{
      console.log("sending game invite from",invitation.host,"to",invitation.newUser);
      console.log(await Game.find({isComplete: false, members: invitation.newUser}).length==0)

      if(invitation.newUser !== invitation.host && 
        await User.findOne({username: invitation.newUser}) &&
        !(await Game.find({isComplete: false, members: invitation.newUser}).length==0))
      {

        if(invitation.members.length == 0){
          socket.join("lobby:"+invitation.host) // instantiate the hosts lobby
        }
        socket.broadcast.to(invitation.newUser).emit('receive-invite', {invitation});
        console.log("game invite success");
      }else{
        console.log("game invite FAIL");
      }

  });

  socket.on('join-game-lobby', async (lobbyData)=>{
      console.log("joining game lobby: ",lobbyData)
      socket.join("lobby:"+lobbyData.host); //add to hosts lobby
      socket.to(lobbyData.host).emit('add-to-hosts-lobby', lobbyData)
  });

  socket.on('launch-game', async ({members, host, word}) => {
    console.log(members, host)
    const game = new Game({
      host,
      word,
      members: [...members, host],
      wrongLetters: [],
      correctLetters: [],
      isComplete: false,
      win: false
    });
    await game.save();
    console.log('launch-game-data', game);
    io.in("lobby:"+host).emit("launch-game",game);
  })

  socket.on('register-move',async (moveData)=>{
    const game = await Game.findById(moveData.gameID);
    game.wrongLetters = moveData.wrongLetters;
    game.correctLetters = moveData.correctLetters;
    const status = checkWin(moveData.correctLetters,moveData.wrongLetters, game.word);
    if(status=="win"){
      game.win = true
      game.isComplete = true
    }else if(status =="lose"){
      game.isComplete = true
    }
    await game.save();
    console.log("register")
    io.in("lobby:"+moveData.host).emit("game-update",game);
  });
  
  socket.on('register-move-log',async ({host, playerMoves, playerNames})=>{
    console.log("REGSITER",{host, playerMoves, playerNames})
    io.in("lobby:"+host).emit("game-update-logs", {playerMoves, playerNames});
  })
};

module.exports = socketConfig; 