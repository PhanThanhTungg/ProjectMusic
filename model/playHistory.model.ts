import mongoose from "mongoose";

const playHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "song",
    required: true
  },
  playDuration: {
    type: Number, 
    default: 0,
    min: 0
  },
  playDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

playHistorySchema.index({ userId: 1, songId: 1, playDate: 1 });
playHistorySchema.index({ songId: 1, playDate: -1 });
playHistorySchema.index({ userId: 1, playDate: -1 });

export default mongoose.model('playHistory', playHistorySchema, 'PlayHistory');
