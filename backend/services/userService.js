import { supabase } from '../supabase.js';

// Tiny helper to avoid custom classes
const throwErr = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
};

export const getUserProfile = async (username) => {
    const { data, error } = await supabase
        .from('users')
        .select('username, github_handle, avatar_url, followers_count, following_count, saved_repos_count, interests, created_at')
        .eq('username', username)
        .single();

    if (error) {
        if (error.code === 'PGRST116') throwErr('User not found', 404);
        throw error;
    }
    return data;
};

export const addFollower = async (targetUsername, followerId) => {
    const { data: targetUser, error: targetError } = await supabase
        .from('users')
        .select('user_id')
        .eq('username', targetUsername)
        .single();

    if (targetError && targetError.code === 'PGRST116') throwErr('Target user not found', 404);
    if (targetError) throw targetError;
    if (!targetUser) throwErr('Target user not found', 404);

    if (followerId === targetUser.user_id) throwErr('You cannot follow yourself.', 400);

    const { error: followError } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: targetUser.user_id }]);

    if (followError) {
        if (followError.code === '23505') throwErr('You are already following this user.', 400);
        if (followError.code === '23503') throwErr('Invalid follower_id: User does not exist.', 400);
        throw followError;
    }
    
    return true;
};

export const removeFollower = async (targetUsername, followerId) => {
    const { data: targetUser, error: targetError } = await supabase
        .from('users')
        .select('user_id')
        .eq('username', targetUsername)
        .single();

    if (targetError && targetError.code === 'PGRST116') throwErr('Target user not found', 404);
    if (targetError) throw targetError;
    if (!targetUser) throwErr('Target user not found', 404);

    const { error: unfollowError, count } = await supabase
        .from('follows')
        .delete({ count: 'exact' })
        .match({ follower_id: followerId, following_id: targetUser.user_id });

    if (unfollowError) throw unfollowError;
    if (count === 0) throwErr('You are not following this user.', 400);

    return true;
};