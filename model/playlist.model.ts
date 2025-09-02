import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  thumbnail: String,
  description: String,
  status: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  followCount: {
    type: Number,
    default: 0
  },
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song"
    }
  ]
},{timestamps: true});

export default mongoose.model('playlist', playlistSchema, 'Playlist');