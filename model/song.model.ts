import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);
const songSchema = new mongoose.Schema({ 
  title: {
    type: String,
    required: true
  },
  thumbnail: String,
  background: String,
  description: String,
  lyrics: String,
  audio: {
    type: String,
    required: true
  },
  like: {
    type: Number,
    default: 0
  },
  slug:{
    type: String,
    slug: "title"
  },
  status:{
    type: String,
    default: "active",
    enum: ["active", "inactive"]
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

export default mongoose.model('song', songSchema, 'Song');

