export interface SpamCheckResult {
  isSpam: boolean;
  reason: string;
  riskScore: number; 
  shouldBlock: boolean;
}

export interface SpamDetectionConfig {
  maxPlaysPerHour: number;
  maxPlaysPerDay: number;
  maxPlaysPerSongPerHour: number;
  suspiciousDurationThreshold: number;
  suspiciousIPThreshold: number;
  botUserAgentPatterns: string[];
}
