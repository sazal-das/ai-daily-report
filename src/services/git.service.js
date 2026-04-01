// git.service.js
import axios from "axios";

export const fetchCommits = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const res = await axios.get(
    `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/commits`,
    {
      params: { since },
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  return res.data.map(commit => ({
    message: commit.commit.message,
    date: commit.commit.author.date,
  }));
};