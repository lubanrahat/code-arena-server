import express, { type Router } from "express";
import PlaylistController from "./playlist.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { playlistCreateSchema } from "./playlist.validation";

export default function registerPlaylistRoutes(): Router {
  const router: Router = express.Router();

  const playlistController = new PlaylistController();

  router.post(
    "/",
    authenticate,
    validateRequest({ body: playlistCreateSchema }),
    playlistController.createPlayList.bind(playlistController),
  );

  router.get(
    "/",
    authenticate,
    playlistController.getPlayAllListDetails.bind(playlistController),
  );

  router.get(
    "/:id",
    authenticate,
    playlistController.getPlayListDetails.bind(playlistController),
  );

  return router;
}
