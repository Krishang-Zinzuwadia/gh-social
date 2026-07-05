import { API_URL } from './config';

export async function getUserBoards(userId: string, token: string, limit: number = 20, offset: number = 0) {
  const response = await fetch(`${API_URL}/boards/user/${userId}?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user boards');
  }

  const json = await response.json();
  return json.data;
}

export async function createBoard(userId: string, boardName: string, token: string) {
  const response = await fetch(`${API_URL}/boards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, board_name: boardName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create board');
  }

  const json = await response.json();
  return json.data;
}

export async function addRepoToBoardAtomic(userId: string, boardId: string, repoId: string, token: string) {
  const response = await fetch(`${API_URL}/boards/${boardId}/save-repo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, repo_id: repoId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save repo to board');
  }

  const json = await response.json();
  return json.data;
}
