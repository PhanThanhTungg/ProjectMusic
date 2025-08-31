import mongoose from "mongoose";
import playHistoryModel from "../model/playHistory.model";
import userModel from "../model/user.model";
import { SpamCheckResult, SpamDetectionConfig } from "../interfaces/client/spam.interface";
export class AntiSpamHelper {
  private static readonly DEFAULT_CONFIG: SpamDetectionConfig = {
    maxPlaysPerHour: 50,
    maxPlaysPerDay: 200,
    maxPlaysPerSongPerHour: 10,
    suspiciousDurationThreshold: 5, 
    suspiciousIPThreshold: 100, 
    botUserAgentPatterns: [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
      'python', 'java', 'go-http-client', 'insomnia'
    ]
  };

  static async checkSpam(
    userId: string,
    songId: string,
    playDuration: number,
    ipAddress: string,
    userAgent: string
  ): Promise<SpamCheckResult> {
    try {
      const checks = await Promise.all([
        this.checkUserBehavior(userId, songId),
        this.checkIPBehavior(ipAddress, songId),
        this.checkUserAgent(userAgent),
        this.checkGeographicAnomaly(ipAddress, userId)
      ]);

      // Tính risk score tổng hợp
      const totalRiskScore = checks.reduce((sum, check) => sum + check.riskScore, 0);
      const averageRiskScore = totalRiskScore / checks.length;

      // Xác định có phải spam không
      const isSpam = averageRiskScore > 70 || checks.some(check => check.shouldBlock);
      const shouldBlock = averageRiskScore > 90 || checks.some(check => check.shouldBlock);

      // Tìm lý do chính
      const mainReason = checks
        .filter(check => check.riskScore > 50)
        .sort((a, b) => b.riskScore - a.riskScore)[0]?.reason || 'No suspicious activity detected';

      return {
        isSpam,
        reason: mainReason,
        riskScore: Math.round(averageRiskScore),
        shouldBlock
      };

    } catch (error) {
      console.error('Error in spam check:', error);
      return {
        isSpam: false,
        reason: 'Spam check failed, allowing request',
        riskScore: 0,
        shouldBlock: false
      };
    }
  }

  private static async checkUserBehavior(userId: string, songId: string): Promise<SpamCheckResult> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [hourlyPlays, dailyPlays, songHourlyPlays] = await Promise.all([
      playHistoryModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        playDate: { $gte: oneHourAgo }
      }),
      playHistoryModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        playDate: { $gte: oneDayAgo }
      }),
      playHistoryModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        songId: new mongoose.Types.ObjectId(songId),
        playDate: { $gte: oneHourAgo }
      })
    ]);

    let riskScore = 0;
    let reason = '';

    if (hourlyPlays > this.DEFAULT_CONFIG.maxPlaysPerHour) {
      riskScore += 40;
      reason = `Too many plays per hour: ${hourlyPlays}`;
    }

    if (dailyPlays > this.DEFAULT_CONFIG.maxPlaysPerDay) {
      riskScore += 30;
      reason = `Too many plays per day: ${dailyPlays}`;
    }

    if (songHourlyPlays > this.DEFAULT_CONFIG.maxPlaysPerSongPerHour) {
      riskScore += 50;
      reason = `Suspicious: ${songHourlyPlays} plays of same song in 1 hour`;
    }

    return {
      isSpam: riskScore > 50,
      reason: reason || 'User behavior normal',
      riskScore,
      shouldBlock: riskScore > 80
    };
  }

  private static async checkIPBehavior(ipAddress: string, songId: string): Promise<SpamCheckResult> {
    if (!ipAddress) {
      return {
        isSpam: false,
        reason: 'No IP address provided',
        riskScore: 0,
        shouldBlock: false
      };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [ipHourlyPlays, ipSongHourlyPlays, uniqueUsersFromIP] = await Promise.all([
      playHistoryModel.countDocuments({
        ipAddress,
        playDate: { $gte: oneHourAgo }
      }),
      playHistoryModel.countDocuments({
        ipAddress,
        songId: new mongoose.Types.ObjectId(songId),
        playDate: { $gte: oneHourAgo }
      }),
      playHistoryModel.distinct('userId', {
        ipAddress,
        playDate: { $gte: oneHourAgo }
      })
    ]);

    let riskScore = 0;
    let reason = '';

    if (ipHourlyPlays > this.DEFAULT_CONFIG.suspiciousIPThreshold) {
      riskScore += 60;
      reason = `Suspicious IP activity: ${ipHourlyPlays} plays/hour from ${ipAddress}`;
    }

    if (ipSongHourlyPlays > 20) {
      riskScore += 70;
      reason = `IP ${ipAddress} playing same song too many times: ${ipSongHourlyPlays}`;
    }

    if (uniqueUsersFromIP.length > 5) {
      riskScore += 80;
      reason = `Multiple users from same IP: ${uniqueUsersFromIP.length} users from ${ipAddress}`;
    }

    return {
      isSpam: riskScore > 50,
      reason: reason || 'IP behavior normal',
      riskScore,
      shouldBlock: riskScore > 80
    };
  }

  private static checkUserAgent(userAgent: string): SpamCheckResult {
    if (!userAgent) {
      return {
        isSpam: false,
        reason: 'No user agent provided',
        riskScore: 0,
        shouldBlock: false
      };
    }

    const lowerUserAgent = userAgent.toLowerCase();
    const isBot = this.DEFAULT_CONFIG.botUserAgentPatterns.some(pattern => 
      lowerUserAgent.includes(pattern)
    );

    if (isBot) {
      return {
        isSpam: true,
        reason: `Bot detected: ${userAgent}`,
        riskScore: 90,
        shouldBlock: true
      };
    }

    // Kiểm tra user agent bất thường
    if (userAgent.length < 10 || userAgent.length > 500) {
      return {
        isSpam: true,
        reason: `Suspicious user agent length: ${userAgent.length}`,
        riskScore: 90,
        shouldBlock: true
      };
    }

    return {
      isSpam: false,
      reason: 'User agent normal',
      riskScore: 0,
      shouldBlock: false
    };
  }

  private static async checkGeographicAnomaly(ipAddress: string, userId: string): Promise<SpamCheckResult> {
    const recentPlays = await playHistoryModel.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
    .sort({ playDate: -1 })
    .limit(10)
    .select('ipAddress playDate');

    if (recentPlays.length < 2) {
      return {
        isSpam: false,
        reason: 'Insufficient data for geographic check',
        riskScore: 0,
        shouldBlock: false
      };
    }

    const uniqueIPs = [...new Set(recentPlays.map(p => p.ipAddress))];
    
    if (uniqueIPs.length > 3) {
      return {
        isSpam: true,
        reason: `Multiple IP addresses detected: ${uniqueIPs.length} different IPs`,
        riskScore: 70,
        shouldBlock: false
      };
    }

    return {
      isSpam: false,
      reason: 'Geographic pattern normal',
      riskScore: 0,
      shouldBlock: false
    };
  }

  static async getSuspiciousIPs(limit: number = 50): Promise<Array<{ip: string, count: number, riskScore: number}>> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const suspiciousIPs = await playHistoryModel.aggregate([
      { $match: { playDate: { $gte: oneHourAgo } } },
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $match: { count: { $gt: this.DEFAULT_CONFIG.suspiciousIPThreshold } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          ip: "$_id",
          count: 1,
          riskScore: {
            $cond: {
              if: { $gt: ["$count", 200] },
              then: 100,
              else: { $multiply: ["$count", 0.5] }
            }
          }
        }
      }
    ]);

    return suspiciousIPs;
  }

  static async getSuspiciousUsers(limit: number = 50): Promise<Array<{userId: string, count: number, riskScore: number}>> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const suspiciousUsers = await playHistoryModel.aggregate([
      { $match: { playDate: { $gte: oneHourAgo } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gt: this.DEFAULT_CONFIG.maxPlaysPerHour } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          userId: "$_id",
          count: 1,
          riskScore: {
            $cond: {
              if: { $gt: ["$count", 100] },
              then: 100,
              else: { $multiply: ["$count", 0.8] }
            }
          }
        }
      }
    ]);

    return suspiciousUsers;
  }
}
