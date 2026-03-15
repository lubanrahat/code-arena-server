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
}

export default PlaylistService;
