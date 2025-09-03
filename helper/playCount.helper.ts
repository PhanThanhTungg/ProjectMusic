import mongoose from "mongoose";
import songModel from "../model/song.model";
import playHistoryModel from "../model/playHistory.model";
import { PlayCountResult, PlayHistoryInterface } from "../interfaces/client/song.interface";
import { AntiSpamHelper } from "./antiSpam.helper";

export class PlayCountHelper {
  private static readonly MIN_VALID_DURATION = 30; 
  private static readonly MAX_DURATION = 3600; 
  private static readonly RATE_LIMIT_WINDOW = 30; 

  static async incrementPlayCount(
    userId: string | null,
    songId: string,
    playDuration: number = 0,
    isCompleted: boolean = false,
    ipAddress?: string,
    userAgent?: string
  ): Promise<PlayCountResult> {
    if(playDuration < this.MIN_VALID_DURATION) {
      return {
        success: false,
        message: "Play duration is less than 30 seconds"
      };
    }
    const session = await mongoose.startSession();
    try {
      let result: PlayCountResult;
      
      await session.withTransaction(async () => {
        if ((userId && !mongoose.Types.ObjectId.isValid(userId)) || !mongoose.Types.ObjectId.isValid(songId)) throw new Error("Invalid user ID or song ID");
        

        if (playDuration < 0 || playDuration > this.MAX_DURATION) throw new Error(`Invalid play duration (must be between 0 and ${this.MAX_DURATION} seconds)`);

        if (isCompleted && playDuration < this.MIN_VALID_DURATION) throw new Error(`Cannot mark as completed with duration less than ${this.MIN_VALID_DURATION} seconds`);

        const song = await songModel.findOne({
          _id: new mongoose.Types.ObjectId(songId),
          status: "active",
          deleted: false
        }).session(session);

        if (!song) throw new Error("Song not found or inactive");

        const spamCheck = await AntiSpamHelper.checkSpam(
          userId,
          songId,
          playDuration,
          ipAddress || '',
          userAgent || ''
        );

        if (spamCheck.shouldBlock) throw new Error(`Request blocked due to suspicious activity: ${spamCheck.reason}`);

        if (spamCheck.isSpam) console.warn(`SPAM DETECTED - User: ${userId || 'Anonymous'}, Song: ${songId}, Reason: ${spamCheck.reason}, Risk Score: ${spamCheck.riskScore}`);

        const rateLimitStart = new Date(Date.now() - this.RATE_LIMIT_WINDOW * 1000);
        
        // Rate limit check - different logic for authenticated vs anonymous users
        let recentPlayCount = 0;
        if (userId) {
          // For authenticated users, check by userId and songId
          recentPlayCount = await playHistoryModel.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            songId: new mongoose.Types.ObjectId(songId),
            playDate: { $gte: rateLimitStart }
          }).session(session);
        } else {
          // For anonymous users, check by IP and songId (more lenient)
          recentPlayCount = await playHistoryModel.countDocuments({
            ipAddress: ipAddress || '',
            songId: new mongoose.Types.ObjectId(songId),
            playDate: { $gte: rateLimitStart }
          }).session(session);
        }

        if (recentPlayCount > 0) {
          throw new Error("Please wait before incrementing play count again");
        }

        const isNewPlay = playDuration >= this.MIN_VALID_DURATION || isCompleted;

        const playHistoryData: PlayHistoryInterface & {
          ipAddress?: string;
          userAgent?: string;
        } = {
          userId: userId ? new mongoose.Types.ObjectId(userId) : null,
          songId: new mongoose.Types.ObjectId(songId),
          playDuration,
          isCompleted,
          ipAddress,
          userAgent 
        };

        await playHistoryModel.create([playHistoryData], { session });

        if (isNewPlay) {
          await songModel.findByIdAndUpdate(
            songId,
            { $inc: { playCount: 1 } },
            { session }
          );
        }

        console.log(`Play count operation - User: ${userId || 'Anonymous'}, Song: ${songId}, Duration: ${playDuration}s, Completed: ${isCompleted}, Valid: ${isNewPlay}`);

        // Lưu kết quả vào biến thay vì return
        result = {
          success: true,
          message: isNewPlay ? "Play count incremented successfully" : "Play history recorded but play count not incremented (insufficient duration)",
          playCount: isNewPlay ? (song.playCount + 1) : song.playCount,
          isNewPlay,
          spamCheck
        };

      }, {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
      });

      // Return kết quả sau khi transaction thành công
      return result!;

    } catch (error) {
      console.error("Error in incrementPlayCount:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    } finally {
      await session.endSession();
    }
  }

  static async getSongPlayStats(songId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(songId)) {
        return null;
      }

      const stats = await playHistoryModel.aggregate([
        { $match: { songId: new mongoose.Types.ObjectId(songId) } },
        {
          $group: {
            _id: null,
            totalPlays: { $sum: 1 },
            completedPlays: { $sum: { $cond: ["$isCompleted", 1, 0] } },
            avgDuration: { $avg: "$playDuration" },
            totalDuration: { $sum: "$playDuration" }
          }
        }
      ]);

      const song = await songModel.findById(songId).select('title playCount');
      if (!song) return null;

      const playStats = stats[0] || { totalPlays: 0, completedPlays: 0, avgDuration: 0, totalDuration: 0 };

      return {
        songId,
        title: song.title,
        totalPlayCount: song.playCount,
        totalPlays: playStats.totalPlays,
        completedPlays: playStats.completedPlays,
        averageDuration: Math.round(playStats.avgDuration * 100) / 100,
        totalDuration: playStats.totalDuration,
        completionRate: playStats.totalPlays > 0 ? Math.round((playStats.completedPlays / playStats.totalPlays) * 100 * 100) / 100 : 0
      };
    } catch (error) {
      console.error("Error getting song play stats:", error);
      return null;
    }
  }

  static async getTopSongsByPlayCount(limit: number = 10, offset: number = 0) {
    try {
      if (limit > 100) limit = 100;
      if (offset < 0) offset = 0;

      const topSongs = await songModel.find({
        status: "active",
        deleted: false,
        playCount: { $gt: 0 } 
      })
      .sort({ playCount: -1, createdAt: -1 }) 
      .skip(offset)
      .limit(limit)
      .select('title thumbnail playCount slug artistId createdAt')
      .lean(); 

      return topSongs;
    } catch (error) {
      console.error("Error getting top songs:", error);
      return [];
    }
  }

  static async batchUpdatePlayCounts(songUpdates: Array<{songId: string, increment: number}>) {
    try {
      const bulkOps = songUpdates.map(update => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.songId) },
          update: { $inc: { playCount: update.increment } }
        }
      }));

      if (bulkOps.length > 0) {
        const result = await songModel.bulkWrite(bulkOps);
        return result;
      }

      return null;
    } catch (error) {
      console.error("Error in batch update play counts:", error);
      return null;
    }
  }
}
