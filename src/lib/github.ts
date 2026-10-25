const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "kachakaran6";
const GITHUB_REPO = process.env.GITHUB_REPO || "Application-json";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export function isGitHubMode(): boolean {
  return Boolean(GITHUB_TOKEN);
}

export function getGitHubConfig() {
  return {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    hasToken: Boolean(GITHUB_TOKEN),
  };
}

function getHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Samyukt-Registry-Studio",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getFileFromGitHub(filePath: string): Promise<{ content: string; sha: string }> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

  const res = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub API error (${res.status}) getting ${filePath}: ${errorBody}`);
  }

  const data = await res.json();
  const rawContent = Buffer.from(data.content, "base64").toString("utf-8");
  return { content: rawContent, sha: data.sha };
}

export async function getFileShaFromGitHub(filePath: string): Promise<string | undefined> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function commitFileToGitHub(
  filePath: string,
  content: string | Buffer,
  commitMessage: string,
  existingSha?: string
): Promise<{ sha: string }> {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not configured. Please add GITHUB_TOKEN to your Vercel Project Environment Variables."
    );
  }

  let sha = existingSha;
  if (!sha) {
    sha = await getFileShaFromGitHub(filePath);
  }

  const base64Content = Buffer.isBuffer(content)
    ? content.toString("base64")
    : Buffer.from(content, "utf-8").toString("base64");

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const body: any = {
    message: commitMessage,
    content: base64Content,
    branch: GITHUB_BRANCH,
  };
  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub API commit failed (${res.status}): ${errorText}`);
  }

  const result = await res.json();
  return { sha: result.content?.sha || "" };
}

export async function listRepoFiles(directoryPath: string = "images"): Promise<string[]> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${directoryPath}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => item.name);
  } catch {
    return [];
  }
}
