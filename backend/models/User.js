const mongoose = require("mongoose");

// Strong email regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu)$/i;

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [emailRegex, "Please enter a valid email address"]
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },

  phone: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  profilePic: {
    type: String,
    default: "https://i.imgur.com/6VBx3io.png"
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie"
    }
  ]

},
{
  timestamps: true
}
);

// Remove password when sending user to frontend
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);