const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  host: {
    type: String,
    require: true,
  },
  word: {
    type: String,
    required: true,
  },
  wrongLetters: {
    type: [String],
  },
  correctLetters: {
    type: [String],
  },
  members: {
    type: [String],
    required: true,
  },
  isComplete: {
    type: Boolean,
    require: true,
  },
  win: {
    type: Boolean,
    require: true,
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
