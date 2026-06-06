const supabase = require("../config/supabase");

const repoTable = "repo";

const getAllRepos = ({ limit, offset }) => {
  return supabase
    .from(repoTable)
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
};

const getRepoById = (repoId) => {
  return supabase
    .from(repoTable)
    .select("*")
    .eq("repo_id", repoId)
    .single();
};

const createRepo = (repoData) => {
  return supabase
    .from(repoTable)
    .insert(repoData)
    .select()
    .single();
};

const updateRepoById = (repoId, repoData) => {
  return supabase
    .from(repoTable)
    .update({
      ...repoData,
      updated_at: new Date().toISOString(),
    })
    .eq("repo_id", repoId)
    .select()
    .single();
};

module.exports = {
  createRepo,
  getAllRepos,
  getRepoById,
  updateRepoById,
};
