import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

const genreSchema = new mongoose.Schema({
  title: String,
  thumbnail: String,
  description: String,
  slug:{
    type: String,
    slug: "title"
  },
  status:{
    type: String,
    default: "active"
  },
  deleted: {
    type: Boolean,
    default: false
  },
},{timestamps: true});

export default mongoose.model('genre', genreSchema, 'Genre');