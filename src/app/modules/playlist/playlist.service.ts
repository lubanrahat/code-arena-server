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
  public addProblemToPlaylist = async (
    playlistId: string,
    problemsId: string[],
  ) => {
    if (!Array.isArray(problemsId) || problemsId.length === 0) {
      throw new AppError(
        "Problem ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.BAD_REQUEST,
      );
    }

    const problemsInPlaylist = await prisma.problemInPlaylist.createMany({
      data: problemsId.map((problemId) => ({
        playListId: playlistId,
        problemId,
      })),
    });

    return problemsInPlaylist;
  };
  public deletePlayList = async (playlistId: string) => {
    const existingPlaylist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });
    if (!existingPlaylist) {
      throw new AppError(
        "Playlist not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
      );
    }
    const playlist = await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });
    return playlist;
  };
  public removeProblemFromPlaylist = async (
    playlistId: string,
    problemId: string,
  ) => {
    if (!Array.isArray(problemId) || problemId.length === 0) {
      throw new AppError(
        "Problem ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.BAD_REQUEST,
      );
    }
    const deletedProblem = await prisma.problemInPlaylist.deleteMany({
      where: {
        playListId: playlistId,
        problemId: {
          in: problemId,
        },
      },
    });

    return deletedProblem;
  };
}

export default PlaylistService;
