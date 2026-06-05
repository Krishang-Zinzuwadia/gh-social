const githubGraphqlUrl = "https://api.github.com/graphql";
const githubRestBaseUrl = "https://api.github.com";

class ServerConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServerConfigError";
    this.statusCode = 500;
  }
}

const buildGitHubHeaders = () => {
  if (!process.env.GITHUB_TOKEN) {
    throw new ServerConfigError("Missing GITHUB_TOKEN in environment.");
  }

  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
  };
};

const parseGitHubRepoUrl = (repoUrl) => {
  try {
    const url = new URL(repoUrl);

    if (url.hostname !== "github.com") {
      return null;
    }

    const [owner, repo] = url.pathname.replace(/^\/|\/$/g, "").split("/");

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo: repo.replace(/\.git$/i, ""),
    };
  } catch (_err) {
    return null;
  }
};

const repoMetadataQuery = `
  query RepoMetadata($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      nameWithOwner
      description
      url
      forkCount
      stargazerCount
      primaryLanguage {
        name
        color
      }
      languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
        totalSize
        edges {
          size
          node {
            name
            color
          }
        }
      }
      repositoryTopics(first: 20) {
        nodes {
          topic {
            name
          }
        }
      }
      pullRequests {
        totalCount
      }
      defaultBranchRef {
        name
        target {
          ... on Commit {
            history(first: 20) {
              nodes {
                author {
                  name
                  email
                  user {
                    login
                    avatarUrl
                    url
                  }
                }
              }
            }
          }
        }
      }
      readme: object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
    }
  }
`;

const requestGitHubGraphql = async (query, variables) => {
  const response = await fetch(githubGraphqlUrl, {
    method: "POST",
    headers: buildGitHubHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub GraphQL request failed (${response.status}): ${message}`);
  }

  const payload = await response.json();

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors.map((error) => error.message).join("; ");
    throw new Error(`GitHub GraphQL error: ${message}`);
  }

  return payload.data;
};

const requestGitHubRest = async (path) => {
  const response = await fetch(`${githubRestBaseUrl}${path}`, {
    headers: buildGitHubHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub REST request failed (${response.status}): ${message}`);
  }

  return response.json();
};

const getUniqueAuthors = (historyNodes = []) => {
  const authors = new Map();

  historyNodes.forEach((node) => {
    const author = node.author;

    if (!author) {
      return;
    }

    const key = author.user?.login || author.email || author.name;

    if (!key || authors.has(key)) {
      return;
    }

    authors.set(key, {
      login: author.user?.login || null,
      name: author.name || null,
      email: author.email || null,
      avatar_url: author.user?.avatarUrl || null,
      profile_url: author.user?.url || null,
    });
  });

  return Array.from(authors.values());
};

const formatRepositoryMetadata = (repository) => {
  const languageEdges = repository.languages?.edges || [];
  const totalLanguageSize = repository.languages?.totalSize || 0;
  const historyNodes = repository.defaultBranchRef?.target?.history?.nodes || [];

  return {
    github_repo_url: repository.url,
    repo_name: repository.name,
    full_name: repository.nameWithOwner,
    description: repository.description,
    primary_language: repository.primaryLanguage
      ? {
          name: repository.primaryLanguage.name,
          color: repository.primaryLanguage.color,
        }
      : null,
    language_breakdown: languageEdges.map((edge) => ({
      name: edge.node.name,
      color: edge.node.color,
      size: edge.size,
      percentage:
        totalLanguageSize > 0
          ? Number(((edge.size / totalLanguageSize) * 100).toFixed(2))
          : 0,
    })),
    topics:
      repository.repositoryTopics?.nodes?.map((node) => node.topic.name) || [],
    readme: repository.readme?.text || "",
    forks_count: repository.forkCount || 0,
    stars_count: repository.stargazerCount || 0,
    pr_count: repository.pullRequests?.totalCount || 0,
    default_branch: repository.defaultBranchRef?.name || null,
    authors: getUniqueAuthors(historyNodes),
  };
};

const fetchReadmeFromGitHubRest = async (owner, repo) => {
  try {
    const data = await requestGitHubRest(`/repos/${owner}/${repo}/readme`);

    if (!data.content) {
      return "";
    }

    return Buffer.from(data.content, "base64").toString("utf8");
  } catch (_err) {
    return "";
  }
};

const fetchRepoMetadataFromGitHub = async (owner, repo) => {
  const data = await requestGitHubGraphql(repoMetadataQuery, {
    owner,
    name: repo,
  });

  if (!data.repository) {
    throw new Error("GitHub repository not found.");
  }

  const metadata = formatRepositoryMetadata(data.repository);

  if (!metadata.readme) {
    metadata.readme = await fetchReadmeFromGitHubRest(owner, repo);
  }

  return metadata;
};

module.exports = {
  fetchRepoMetadataFromGitHub,
  parseGitHubRepoUrl,
};
