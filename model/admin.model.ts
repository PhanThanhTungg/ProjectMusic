import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
import bcrypt from "bcrypt";
mongoose.plugin(slug);

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }, 
  phone:{
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"]
  },
  deleted: {
    type: Boolean,
    default: false
  }
},{timestamps: true});

adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); 
  }
  next();
})

export default mongoose.model('admin', adminSchema, 'Admin');