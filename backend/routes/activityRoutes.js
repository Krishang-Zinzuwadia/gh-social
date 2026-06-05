const express = require("express");
const activityController = require("../controllers/activityController");

const router = express.Router();

// Routes only connect URLs to controller functions.

// Get all activity records.
router.get("/", activityController.getAllActivity);

// Get all activity records for one user.
router.get("/user/:userId", activityController.getUserActivity);

// Get saved activity records for one user.
router.get("/user/:userId/saved", activityController.getSavedActivity);

// Get one activity record for a specific user and repo.
router.get("/user/:userId/repo/:repoId", activityController.getActivityByUserAndRepo);

// Update one activity record using user and repo ids.
router.patch("/user/:userId/repo/:repoId", activityController.updateActivityByUserAndRepo);

// Get one activity record by activity id.
router.get("/:activityId", activityController.getActivityById);

// Create a new activity record.
router.post("/", activityController.createActivity);

// Update one activity record by activity id.
router.patch("/:activityId", activityController.updateActivityById);

// Delete one activity record by activity id.
router.delete("/:activityId", activityController.deleteActivityById);

module.exports = router;
