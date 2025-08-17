import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  }, 
  avatar: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  songsLiked:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song"
    }
  ],
  verifyArtist:{
    type: Boolean,
    default: false
  },
  bio:{
    type: String,
    required: false,
    default: null
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "unknown"],
    default: "unknown"
  },
  dateOfBirth:{
    type: String,
    required: false,
    default: null
  },
  country: {
    type: String,
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  deleted: {
    type: Boolean,
    default: false
  }
},{timestamps: true});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); 
  }
  next();
})

export default mongoose.model('user', userSchema, 'User');