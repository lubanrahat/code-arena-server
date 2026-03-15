import prisma from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import ErrorCodes from "../../shared/errors/error-codes";
import type { PlaylistCreateInput } from "./playlist.validation";

class PlaylistService {
  public createPlayList = async (
    payload: PlaylistCreateInput,
    userId: string,
  ) => {
    const { name, description } = payload;

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return playlist;
  };
  public getPlayAllListDetails = async (userId: string) => {
    const playlists = await prisma.playlist.findMany({
      where: {
        userId,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    return playlists;
  };
  public getPlayListDetails = async (playlistId: string, userId: string) => {
    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
        userId,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new AppError(
        "Playlist not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
      );
    }

    return playlist;
  };
}

export default PlaylistService;
