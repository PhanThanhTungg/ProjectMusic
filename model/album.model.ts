import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  thumbnail: String,
  description: String,
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  idArtist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  followCount: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Boolean,
    default: false
  }
},{timestamps: true});

export default mongoose.model('album', albumSchema, 'Album');