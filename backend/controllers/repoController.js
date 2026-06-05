const githubService = require("../services/githubService");
const repoService = require("../services/repoService");
const summaryService = require("../services/summaryService");
const {
  sendControllerError,
  sendError,
  sendSuccess,
  sendSupabaseError,
} = require("../utils/response");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sendRepoDatabaseError = (res, error) => {
  return sendSupabaseError(res, error, {
    notFoundMessage: "Repository not found.",
    conflictMessage: "Repository already exists.",
    missingRequiredMessage: "Repository data is missing required fields.",
    invalidReferenceMessage: "Repository data references an invalid record.",
  });
};

const buildRepoPayload = async ({ github_repo_url: githubRepoUrl, owner_id: ownerId }) => {
  const parsedRepo = githubService.parseGitHubRepoUrl(githubRepoUrl);

  if (!parsedRepo) {
    throw new Error("github_repo_url must be a valid GitHub repository URL.");
  }

  const githubRepo = await githubService.fetchRepoMetadataFromGitHub(
    parsedRepo.owner,
    parsedRepo.repo
  );

  return {
    github_repo_url: githubRepo.github_repo_url,
    owner_id: ownerId,
    repo_name: githubRepo.repo_name,
    full_name: githubRepo.full_name,
    description: githubRepo.description,
    language_used: githubRepo.language_breakdown,
    topics: githubRepo.topics || [],
    readme_summary: summaryService.summarizeReadme(githubRepo.readme),
    forks_count: githubRepo.forks_count || 0,
    pr_count: githubRepo.pr_count || 0,
  };
};

const getAllRepos = async (_req, res) => {
  const { data, error } = await repoService.getAllRepos();

  if (error) {
    return sendRepoDatabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
};

const getRepoById = async (req, res) => {
  const { repoId } = req.params;

  if (!uuidRegex.test(repoId)) {
    return sendError(res, 400, "repoId must be a valid UUID.");
  }

  const { data, error } = await repoService.getRepoById(repoId);

  if (error) {
    return sendRepoDatabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
};

const importRepo = async (req, res) => {
  const { github_repo_url: githubRepoUrl, owner_id: ownerId } = req.body;

  if (!githubRepoUrl || !ownerId) {
    return sendError(res, 400, "github_repo_url and owner_id are required.");
  }

  try {
    const repoPayload = await buildRepoPayload(req.body);
    const { data, error } = await repoService.createRepo(repoPayload);

    if (error) {
      return sendRepoDatabaseError(res, error);
    }

    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendControllerError(res, err);
  }
};

const syncRepo = async (req, res) => {
  const { repoId } = req.params;
  const { github_repo_url: githubRepoUrl, owner_id: ownerId } = req.body;

  if (!uuidRegex.test(repoId)) {
    return sendError(res, 400, "repoId must be a valid UUID.");
  }

  if (!githubRepoUrl || !ownerId) {
    return sendError(res, 400, "github_repo_url and owner_id are required.");
  }

  try {
    const repoPayload = await buildRepoPayload(req.body);
    const { data, error } = await repoService.updateRepoById(repoId, repoPayload);

    if (error) {
      return sendRepoDatabaseError(res, error);
    }

    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendControllerError(res, err);
  }
};

module.exports = {
  getAllRepos,
  getRepoById,
  importRepo,
  syncRepo,
};
