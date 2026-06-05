const userService = require("../services/userService");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isNotFoundError = (error) => error && error.code === "PGRST116";

// Fetch a user's public profile.
const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const { data, error } = await userService.getUserProfile(username);

    if (isNotFoundError(error)) {
      return res.status(404).json({ message: "User not found" });
    }

    if (error) {
      throw error;
    }

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Follow a user.
const followUser = async (req, res) => {
  const { username } = req.params;
  const { follower_id: followerId } = req.body;

  if (!followerId) {
    return res.status(400).json({ error: "follower_id is required in the request body." });
  }

  if (!uuidRegex.test(followerId)) {
    return res.status(400).json({ error: "follower_id must be a valid UUID." });
  }

  try {
    const { data: targetUser, error: targetError } =
      await userService.getUserIdByUsername(username);

    if (isNotFoundError(targetError) || !targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (targetError) {
      throw targetError;
    }

    const { user_id: targetUserId } = targetUser;

    if (followerId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const { error: followError } = await userService.followUser(followerId, targetUserId);

    if (followError) {
      if (followError.code === "23505") {
        return res.status(400).json({ message: "You are already following this user." });
      }

      if (followError.code === "23503") {
        return res.status(400).json({ message: "Invalid follower_id: User does not exist." });
      }

      throw followError;
    }

    return res.json({ status: "success", message: `Successfully followed ${username}` });
  } catch (err) {
    console.error("Error following user:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Unfollow a user.
const unfollowUser = async (req, res) => {
  const { username } = req.params;
  const { follower_id: followerId } = req.query;

  if (!followerId) {
    return res.status(400).json({ error: "follower_id is required as a query parameter." });
  }

  if (!uuidRegex.test(followerId)) {
    return res.status(400).json({ error: "follower_id must be a valid UUID." });
  }

  try {
    const { data: targetUser, error: targetError } =
      await userService.getUserIdByUsername(username);

    if (isNotFoundError(targetError) || !targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (targetError) {
      throw targetError;
    }

    const { user_id: targetUserId } = targetUser;

    const { error: unfollowError, count } = await userService.unfollowUser(
      followerId,
      targetUserId
    );

    if (unfollowError) {
      throw unfollowError;
    }

    if (count === 0) {
      return res.status(400).json({ message: "You are not following this user." });
    }

    return res.json({ status: "success", message: `Successfully unfollowed ${username}` });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  getUserProfile,
  followUser,
  unfollowUser,
};
