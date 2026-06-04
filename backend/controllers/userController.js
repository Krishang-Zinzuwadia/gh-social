import * as userService from '../services/userService.js';

export const getProfile = async (req, res) => {
    try {
        const data = await userService.getUserProfile(req.params.username);
        res.json({ status: "success", data });
    } catch (err) {
        // Checking for our attached status codes instead of strings!
        if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
        
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const followUser = async (req, res) => {
    const { username } = req.params;
    
    // SECURE FIX: Grabbing ID from the verified token, NOT the user's input!
    const follower_id = req.user.id; 

    try {
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
    
    // SECURE FIX: Grabbing ID from the verified token, NOT the user's input!
    const follower_id = req.user.id;

    try {
        await userService.removeFollower(username, follower_id);
        res.json({ status: "success", message: `Successfully unfollowed ${username}` });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
        
        console.error("Error unfollowing user:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};