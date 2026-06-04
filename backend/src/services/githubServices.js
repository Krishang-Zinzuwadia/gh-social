import axios from "axios";

const githubAPI = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

export const fetchRepoFromGitHub = async (owner, repo) => {
  const response = await githubAPI.get(`/repos/${owner}/${repo}`);

  return response.data;
};
