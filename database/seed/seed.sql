INSERT INTO Repo (
    github_repo_url,
    owner_id,
    repo_name,
    full_name,
    description,
    language_used,
    topics,
    readme_summary,
    likes_count,
    comments_count,
    saves_count,
    views_count,
    forks_count,
    pr_count
)
VALUES

(
    'https://github.com/alexdev/ai-task-manager',
    'github_1001',
    'ai-task-manager',
    'alexdev/ai-task-manager',
    'AI powered task management system using NLP.',
    '["Python", "FastAPI", "PostgreSQL"]',
    '["AI", "Productivity", "Backend"]',
    'An intelligent assistant for managing tasks using natural language.',
    245,
    39,
    110,
    5400,
    76,
    18
),

(
    'https://github.com/sarahcodes/devconnect',
    'github_1002',
    'devconnect',
    'sarahcodes/devconnect',
    'Social platform for developers to discover repositories.',
    '["TypeScript", "React", "Node.js"]',
    '["Social", "Web", "Frontend"]',
    'A GitHub-inspired social discovery platform for developers.',
    420,
    87,
    201,
    12000,
    143,
    42
),

(
    'https://github.com/rajtech/ml-visualizer',
    'github_1003',
    'ml-visualizer',
    'rajtech/ml-visualizer',
    'Machine learning visualization dashboard.',
    '["Python", "TensorFlow", "Streamlit"]',
    '["ML", "Visualization", "AI"]',
    'Interactive dashboard for visualizing machine learning models.',
    178,
    21,
    98,
    3900,
    52,
    9
),

(
    'https://github.com/cloudsync/realtime-chat',
    'github_1004',
    'realtime-chat',
    'cloudsync/realtime-chat',
    'Scalable realtime chat application.',
    '["Go", "Redis", "WebSocket"]',
    '["Realtime", "Chat", "Distributed Systems"]',
    'Low latency realtime messaging system using Redis pub/sub.',
    532,
    103,
    244,
    21000,
    301,
    65
),

(
    'https://github.com/nexlabs/code-review-ai',
    'github_1005',
    'code-review-ai',
    'nexlabs/code-review-ai',
    'AI assistant for automated pull request reviews.',
    '["Python", "OpenAI", "Docker"]',
    '["AI", "Code Review", "Automation"]',
    'Automated pull request analysis and smart review suggestions.',
    690,
    140,
    350,
    34000,
    470,
    120
);