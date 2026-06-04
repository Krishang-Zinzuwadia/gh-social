import pool from "../config/db.js";

export const createRepo = async (repoData) => {
  const query = `
    INSERT INTO Repo (
      github_repo_url,
      owner_id,
      repo_name,
      full_name,
      description,
      language_used,
      topics,
      readme_summary,
      forks_count
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;

  const values = [
    repoData.github_repo_url,
    repoData.owner_id,
    repoData.repo_name,
    repoData.full_name,
    repoData.description,
    JSON.stringify(repoData.language_used),
    JSON.stringify(repoData.topics),
    repoData.readme_summary,
    repoData.forks_count,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getRepos = async () => {
  const result = await pool.query(
    "SELECT * FROM Repo ORDER BY created_at DESC",
  );

  return result.rows;
};

export const getRepo = async (id) => {
  const result = await pool.query("SELECT * FROM Repo WHERE repo_id = $1", [
    id,
  ]);

  return result.rows[0];
};
