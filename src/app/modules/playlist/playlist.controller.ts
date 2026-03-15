import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import { catchAsync } from "../../shared/utils/async-handler.util";
import PlaylistService from "./playlist.service";
import type { Request, Response } from "express";

class PlaylistController {
  public createPlayList = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user.id;

    const playlistService = new PlaylistService();
    const result = await playlistService.createPlayList(payload, userId);

    return ResponseUtil.success(
      res,
      result,
      "Playlist created successfully",
      HttpStatus.CREATED,
    );
  });
  public getPlayAllListDetails = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const playlistService = new PlaylistService();
    const result = await playlistService.getPlayAllListDetails(userId);
    return ResponseUtil.success(
      res,
      result,
      "Playlists fetched successfully",
      HttpStatus.OK,
    );
  });
}

export default PlaylistController;