import { Router } from "express"

export const registerIndexRoutes = (): Router => {
    const router: Router = Router()

    return router
}

export const IndexRouter = registerIndexRoutes();