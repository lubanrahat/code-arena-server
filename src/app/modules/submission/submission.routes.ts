import express, { type Router } from "express";
import SubmissionController from "./submission.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";


export default function registerSubmissionRoutes(): Router {
    const router: Router = express.Router();

    const submissionController = new SubmissionController();

    router.get("/get-all-submissions", authenticate, submissionController.getAllSubmissions);
    router.get("/get-submissions/:problemId", authenticate, submissionController.getSubmissionsForProblem);
    router.get("/get-submissions-count/:problemId", authenticate, submissionController.getAllTheSubmissionsForProblem);

    return router;
}