import { supabase } from '../supabase.js';

export const getUserProfile = async (username) => {
    const { data, error } = await supabase
        .from('users')
        .select('username, github_handle, avatar_url, followers_count, following_count, saved_repos_count, interests, created_at')
        .eq('username', username)
        .single();

    if (error) {
        if (error.code === 'PGRST116') throw new Error('User not found');
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

    if (targetError && targetError.code === 'PGRST116') throw new Error('Target user not found');
    if (targetError) throw targetError;
    if (!targetUser) throw new Error('Target user not found');

    if (followerId === targetUser.user_id) throw new Error('You cannot follow yourself.');

    const { error: followError } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: targetUser.user_id }]);

    if (followError) {
        if (followError.code === '23505') throw new Error('You are already following this user.');
        if (followError.code === '23503') throw new Error('Invalid follower_id: User does not exist.');
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

    // I added the PGRST116 database crash check here for you too!
    if (targetError && targetError.code === 'PGRST116') throw new Error('Target user not found');
    if (targetError) throw targetError;
    if (!targetUser) throw new Error('Target user not found');

    const { error: unfollowError, count } = await supabase
        .from('follows')
        .delete({ count: 'exact' })
        .match({ follower_id: followerId, following_id: targetUser.user_id });

    if (unfollowError) throw unfollowError;
    if (count === 0) throw new Error('You are not following this user.');

    return true;
};