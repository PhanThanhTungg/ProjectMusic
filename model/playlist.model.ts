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
    slug: "title"
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  listFollowers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  ],
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song"
    }
  ]
},{timestamps: true});

export default mongoose.model('playlist', playlistSchema, 'Playlist');