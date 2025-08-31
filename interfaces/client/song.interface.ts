import mongoose from "mongoose";
import { Pagination } from "../admin/common.interface";
import { SuccessResponse } from "../common/response.type";
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

export interface SongWithPlayCount {
  _id: string;
  title: string;
  thumbnail?: string;
  background?: string;
  description?: string;
  audio: string;
  like: number;
  playCount: number;
  slug: string;
  status: string;
  artistId: string;
  genreId: string;
  albumId?: string;
  collaborationArtistIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayCountResult {
  success: boolean;
  message: string;
  playCount?: number;
  isNewPlay?: boolean;
  spamCheck?: SpamCheckResult;
}