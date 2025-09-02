import mongoose from "mongoose";
import { Pagination } from "../admin/common.interface";
import { SuccessResponse } from "../common/response.interface";
import { SpamCheckResult } from "./spam.interface";

export interface GetMySongInterface extends SuccessResponse {
  songs: any[];
  pagination: Pagination;
}

export interface PlayHistoryInterface {
  userId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  playDuration?: number;
  isCompleted?: boolean;
}

export interface PlayCountResult {
  success: boolean;
  message: string;
  playCount?: number;
  isNewPlay?: boolean;
  spamCheck?: SpamCheckResult;
}