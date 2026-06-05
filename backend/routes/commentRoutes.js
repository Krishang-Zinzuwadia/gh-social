const express = require("express");
const commentController = require("../controllers/commentController");

const router = express.Router();

// Routes only connect URLs to controller functions.

// Get all comment records.
router.get("/", commentController.getAllComments);

// Get all comment records for one repository.
router.get("/repo/:repoId", commentController.getCommentsByRepo);

// Get all comment records for one user.
router.get("/user/:userId", commentController.getCommentsByUser);

// Get replies for one parent comment.
router.get("/parent/:parentCommentId", commentController.getRepliesByParentComment);

// Get one comment record by comment id.
router.get("/:commentId", commentController.getCommentById);

// Create a new comment record.
router.post("/", commentController.createComment);

// Update one comment record by comment id.
router.patch("/:commentId", commentController.updateCommentById);

// Delete one comment record by comment id.
router.delete("/:commentId", commentController.deleteCommentById);

module.exports = router;
