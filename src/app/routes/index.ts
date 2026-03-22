import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";
import registerAuthRoutes from "../modules/auth/auth.routes";
import registerProblemRoutes from "../modules/problems/problem.routes";
import registerExecuteCodeRoutes from "../modules/executeCode/executeCode.routes";
import registerSubmissionRoutes from "../modules/submission/submission.routes";
import registerPlaylistRoutes from "../modules/playlist/playlist.routes";
import registerUserRoutes from "../modules/user/user.routes";
import registerAiDiscussionRoutes from "../modules/ai-discussion/ai-discussion.route";

export const registerIndexRoutes = (): Router => {
  const router: Router = Router();

  router.use(registerHealthRoutes());
  router.use("/auth", registerAuthRoutes());
  router.use("/problems", registerProblemRoutes());
  router.use("/execute-code", registerExecuteCodeRoutes());
  router.use("/submission", registerSubmissionRoutes());
  router.use("/playlist", registerPlaylistRoutes());  
  router.use("/user", registerUserRoutes());
  router.use("/ai-discussion", registerAiDiscussionRoutes());

  return router;
};

export const IndexRouter = registerIndexRoutes();
