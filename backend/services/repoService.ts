import supabase from '../config/supabase.js';
import type { RepoInsert, RepoUpdate, PaginationParams } from '../types/index.js';

const repoTable = "repo";

// Fetch all repos with pagination, newest first.
export function getAllRepos({ limit, offset }: PaginationParams) {
  return supabase
    .from(repoTable)
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
}

// Fetch one repo by primary key.
export function getRepoById(repoId: string) {
  return supabase
    .from(repoTable)
    .select("*")
    .eq("repo_id", repoId)
    .single();
}

// Insert a new repo record.
export function createRepo(repoData: RepoInsert) {
  return supabase
    .from(repoTable)
    .insert(repoData)
    .select()
    .single();
}

// Increment view count for a repo.
export function incrementRepoViews(repoId: string) {
  return supabase.rpc('increment_repo_views', { rid: repoId });
}

// Update one repo by primary key.
export function updateRepoById(repoId: string, repoData: RepoUpdate) {
  return supabase
    .from(repoTable)
    .update({
      ...repoData,
      updated_at: new Date().toISOString(),
    })
    .eq("repo_id", repoId)
    .select()
    .single();
}
