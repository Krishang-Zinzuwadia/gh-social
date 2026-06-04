import * as userService from '../services/userService.js';

const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getProfile = async (req, res) => {
    try {
        const data = await userService.getUserProfile(req.params.username);
        res.json({ status: "success", data });
    } catch (err) {
        if (err.message === 'User not found') return res.status(404).json({ message: err.message });
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const followUser = async (req, res) => {
    const { username } = req.params;
    const { follower_id } = req.body;

    if (!follower_id) return res.status(400).json({ error: "follower_id is required in the request body." });
    if (!isValidUUID(follower_id)) return res.status(400).json({ error: "follower_id must be a valid UUID." });

    try {
        await userService.addFollower(username, follower_id);
        res.json({ status: "success", message: `Successfully followed ${username}` });
    } catch (err) {
        if (err.message === 'Target user not found') return res.status(404).json({ message: err.message });
        
        // Catch all our specific 400 errors from the Service
        const badRequests = ['You cannot follow yourself.', 'You are already following this user.', 'Invalid follower_id: User does not exist.'];
        if (badRequests.includes(err.message)) return res.status(400).json({ message: err.message });
        
        console.error("Error following user:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const unfollowUser = async (req, res) => {
    const { username } = req.params;
    const { follower_id } = req.query;

    if (!follower_id) return res.status(400).json({ error: "follower_id is required as a query parameter." });
    if (!isValidUUID(follower_id)) return res.status(400).json({ error: "follower_id must be a valid UUID." });

    try {
        await userService.removeFollower(username, follower_id);
        res.json({ status: "success", message: `Successfully unfollowed ${username}` });
    } catch (err) {
        if (err.message === 'Target user not found') return res.status(404).json({ message: err.message });
        if (err.message === 'You are not following this user.') return res.status(400).json({ message: err.message });
        
        console.error("Error unfollowing user:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};