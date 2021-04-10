const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 7) {
        throw new Error("Password must 7 characters or longer");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  socketIDs: {
    type: [String],
    required: true,
  },
});

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    return { error: "Invalid Credentials!" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { error: "Invalid Credentials" };
  }

  return { user };
};

//Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
