import * as userService from '../services/userService.js';

export const getProfile = async (req, res) => {
    try {
        const data = await userService.getUserProfile(req.params.username);
        res.json({ status: "success", data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
        
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const followUser = async (req, res) => {
    const { username } = req.params;

    try {
        // SAFEGUARD: Ensure req.user exists before trying to read .id
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized: Missing user context." });
        }
        const follower_id = req.user.id; 

        await userService.addFollower(username, follower_id);
        res.json({ status: "success", message: `Successfully followed ${username}` });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
        
        console.error("Error following user:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const unfollowUser = async (req, res) => {
    const { username } = req.params;

    try {
        // SAFEGUARD: Ensure req.user exists before trying to read .id
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized: Missing user context." });
        }
        const follower_id = req.user.id;

        await userService.removeFollower(username, follower_id);
        res.json({ status: "success", message: `Successfully unfollowed ${username}` });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
        
        console.error("Error unfollowing user:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};