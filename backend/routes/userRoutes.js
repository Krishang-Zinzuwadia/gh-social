const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// GET /api/users/:username - Fetch a user's public profile
router.get("/:username", userController.getUserProfile);

// POST /api/users/:username/follow - Follow a user
router.post("/:username/follow", userController.followUser);

// Unfollow a user
router.delete("/:username/follow", userController.unfollowUser);

module.exports = router;
