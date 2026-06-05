const express = require("express");
const repoController = require("../controllers/repoController");

const router = express.Router();

// Routes only connect URLs to controller functions.

// Get all repository records.
router.get("/", repoController.getAllRepos);

// Import one repository from GitHub.
router.post("/import", repoController.importRepo);

// Get one repository record by repo id.
router.get("/:repoId", repoController.getRepoById);

// Refresh one repository record from GitHub.
router.post("/:repoId/sync", repoController.syncRepo);

module.exports = router;
