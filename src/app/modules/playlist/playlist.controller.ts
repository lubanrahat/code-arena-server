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
  public getPlayAllListDetails = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const playlistService = new PlaylistService();
      const result = await playlistService.getPlayAllListDetails(userId);
      return ResponseUtil.success(
        res,
        result,
        "Playlists fetched successfully",
        HttpStatus.OK,
      );
    },
  );
  public getPlayListDetails = catchAsync(
    async (req: Request, res: Response) => {
      const playlistId = req.params.id;
      const userId = req.user.id;
      const playlistService = new PlaylistService();
      const result = await playlistService.getPlayListDetails(
        playlistId as string,
        userId,
      );
      return ResponseUtil.success(
        res,
        result,
        "Playlist fetched successfully",
        HttpStatus.OK,
      );
    },
  );
  public addProblemToPlaylist = catchAsync(
    async (req: Request, res: Response) => {
      const playlistId = req.params.id;
      const problemsId = req.body.problemsId;
      const playlistService = new PlaylistService();
      const result = await playlistService.addProblemToPlaylist(
        playlistId as string,
        problemsId as string[],
      );
      return ResponseUtil.success(
        res,
        result,
        "Problem added to playlist successfully",
        HttpStatus.OK,
      );
    },
  );
  public deletePlayList = catchAsync(async (req: Request, res: Response) => {
    const playlistId = req.params.id;
    const playlistService = new PlaylistService();
    const result = await playlistService.deletePlayList(playlistId as string);
    return ResponseUtil.success(
      res,
      result,
      "Playlist deleted successfully",
      HttpStatus.OK,
    );
  });
  public removeProblemFromPlaylist = catchAsync(
    async (req: Request, res: Response) => {
      const playlistId = req.params.id;
      const problemsId = req.body.problemsId;
      const playlistService = new PlaylistService();
      const result = await playlistService.removeProblemFromPlaylist(
        playlistId as string,
        problemsId as string,
      );
      return ResponseUtil.success(
        res,
        result,
        "Problem removed from playlist successfully",
        HttpStatus.OK,
      );
    },
  );
}

export default PlaylistController;
