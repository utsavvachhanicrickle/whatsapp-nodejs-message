import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: String,
  createdAt: {
    type: Date,
    default: new Date()
  },
  refreshToken: { type: String } 
});

const User = mongoose.model("User", userSchema);

export default User;