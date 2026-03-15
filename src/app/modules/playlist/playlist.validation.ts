import { z } from "zod";

export const playlistCreateSchema = z.object({
  name: z.string().min(1, "Playlist name is required"),
  description: z
    .string()
    .min(1, "Playlist description is required")
    .max(500, "Playlist description cannot be more than 500 characters"),
});

export type PlaylistCreateInput = z.infer<typeof playlistCreateSchema>;
