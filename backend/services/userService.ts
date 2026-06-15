import supabase, { supabaseAdmin } from '../config/supabase.js';
import type { UserProfile, UserUpdate } from '../types/database.js';
import type {
  OnboardingStatusResponse,
  OnboardingStepStatus,
} from '../types/onboarding.js';

const USER_PROFILE_COLUMNS = [
  'username',
  'full_name',
  'date_of_birth',
  'bio',
  'github_url',
  'github_handle',
  'avatar_url',
  'followers_count',
  'following_count',
  'saved_repos_count',
  'interests',
  'skills',
  'tech_stack',
  'onboarding_completed',
  'created_at',
].join(', ');

const ONBOARDING_EVALUATION_COLUMNS = [
  'username',
  'full_name',
  'bio',
  'avatar_url',
  'github_url',
  'github_handle',
  'interests',
  'skills',
  'tech_stack',
  'onboarding_completed',
  'date_of_birth',
  'followers_count',
  'following_count',
  'saved_repos_count',
  'created_at',
].join(', ');

const DEFAULT_USERNAME_PREFIX = 'user_';

type OnboardingProfileState = Pick<
  UserProfile,
  | 'username'
  | 'full_name'
  | 'bio'
  | 'avatar_url'
  | 'github_url'
  | 'github_handle'
  | 'interests'
  | 'skills'
  | 'tech_stack'
  | 'onboarding_completed'
>;

function isDefaultUsername(username: string): boolean {
  return /^user_[0-9a-f]{8}$/.test(username);
}

function hasNonEmptyJsonArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function evaluateOnboardingSteps(profile: OnboardingProfileState): OnboardingStepStatus {
  const profileComplete =
    profile.username.trim().length > 0 &&
    !isDefaultUsername(profile.username) &&
    Boolean(profile.full_name?.trim());

  const githubComplete = Boolean(profile.github_handle?.trim());

  return {
    profile: profileComplete,
    github: githubComplete,
    interests: hasNonEmptyJsonArray(profile.interests),
    skills: hasNonEmptyJsonArray(profile.skills),
    tech_stack: hasNonEmptyJsonArray(profile.tech_stack),
  };
}

function buildMissingFields(steps: OnboardingStepStatus, profile: OnboardingProfileState): string[] {
  const missing: string[] = [];

  if (!steps.profile) {
    if (!profile.username.trim() || isDefaultUsername(profile.username)) {
      missing.push('username');
    }
    if (!profile.full_name?.trim()) {
      missing.push('full_name');
    }
  }

  if (!steps.github) {
    missing.push('github');
  }

  if (!steps.interests) {
    missing.push('interests');
  }

  if (!steps.skills) {
    missing.push('skills');
  }

  if (!steps.tech_stack) {
    missing.push('tech_stack');
  }

  return missing;
}

function isOnboardingComplete(profile: OnboardingProfileState): boolean {
  const steps = evaluateOnboardingSteps(profile);
  return buildMissingFields(steps, profile).length === 0;
}


function buildOnboardingStatus(profile: UserProfile): OnboardingStatusResponse {
  const steps = evaluateOnboardingSteps(profile);
  const missingFields = buildMissingFields(steps, profile);

  return {
    isComplete: profile.onboarding_completed || missingFields.length === 0,
    steps,
    missingFields,
    profile,
  };
}

// Fetch onboarding status and profile for the authenticated user.
export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(ONBOARDING_EVALUATION_COLUMNS)
    .eq('user_id', userId)
    .single();

  if (error) {
    return { data: null, error };
  }

  // Double cast to unknown first to avoid the "neither type sufficiently overlaps" error
  return { data: buildOnboardingStatus(data as unknown as UserProfile), error: null };
}

// Fetch a user's public profile by username.
export function getUserProfileByUsername(username: string) {
  return supabase
    .from('users')
    .select(USER_PROFILE_COLUMNS)
    .eq('username', username)
    .single();
}

// Fetch a user's UUID by username.
export function getUserIdByUsername(username: string) {
  return supabase
    .from('users')
    .select('user_id')
    .eq('username', username)
    .single();
}

// Create a follower/following relationship.
export function followUser(followerId: string, followingId: string) {
  return supabaseAdmin
    .from('follows')
    .insert([
      {
        follower_id: followerId,
        following_id: followingId,
      },
    ]);
}

// Delete a follower/following relationship.
export function unfollowUser(followerId: string, followingId: string) {
  return supabaseAdmin
    .from('follows')
    .delete({ count: 'exact' })
    .match({
      follower_id: followerId,
      following_id: followingId,
    });
}

// List all users (public profiles).
export function getAllUsers() {
  return supabase
    .from('users')
    .select(USER_PROFILE_COLUMNS)
    .order('created_at', { ascending: false });
}

// Fetch a user's public profile by UUID.
export function getUserById(userId: string) {
  return supabase
    .from('users')
    .select(USER_PROFILE_COLUMNS)
    .eq('user_id', userId)
    .single();
}

// Update profile fields. The PostgreSQL trigger 'tr_evaluate_onboarding' 
// will automatically compute and persist 'onboarding_completed' atomically.
export async function updateUserProfile(userId: string, updates: UserUpdate) {
  const { data: updatedRow, error: updateError } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select(USER_PROFILE_COLUMNS)
    .single();

  if (updateError) {
    return { data: null, error: updateError };
  }

  return { data: updatedRow, error: null };
}