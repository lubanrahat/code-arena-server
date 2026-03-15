import prisma from "../../lib/prisma";
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
}

export default PlaylistService;
