import express from "express";
import {
    getAllRepos,
    getRepoById,
    importRepo,
    syncRepos,
} from "../controllers/repoController.js";

const router = express.Router();

router.get("/", getAllRepos);

router.get("/:id", getRepoById);

router.post("/import", importRepo);

router.post("/sync", syncRepos);

export default router;
