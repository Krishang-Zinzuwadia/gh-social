-- GH Social seed data
-- Run after migrations 001–007.
-- Requires Supabase (auth.users + pgcrypto for crypt()).

-- ─── Repos ───────────────────────────────────────────────────────────────────

INSERT INTO Repo (
    repo_id,
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
    '33333333-3333-3333-3333-333333333333',
    'https://github.com/alexdev/ai-task-manager',
    'github_1001',
    'ai-task-manager',
    'alexdev/ai-task-manager',
    'AI powered task management system using NLP.',
    '[
        {"name": "Python", "color": null, "size": 1, "percentage": 33.33},
        {"name": "FastAPI", "color": null, "size": 1, "percentage": 33.33},
        {"name": "PostgreSQL", "color": null, "size": 1, "percentage": 33.34}
    ]'::jsonb,
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
    '66666666-6666-6666-6666-666666666666',
    'https://github.com/sarahcodes/devconnect',
    'github_1002',
    'devconnect',
    'sarahcodes/devconnect',
    'Social platform for developers to discover repositories.',
    '[
        {"name": "TypeScript", "color": null, "size": 1, "percentage": 33.33},
        {"name": "React", "color": null, "size": 1, "percentage": 33.33},
        {"name": "Node.js", "color": null, "size": 1, "percentage": 33.34}
    ]'::jsonb,
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
    '99999999-9999-9999-9999-999999999999',
    'https://github.com/rajtech/ml-visualizer',
    'github_1003',
    'ml-visualizer',
    'rajtech/ml-visualizer',
    'Machine learning visualization dashboard.',
    '[
        {"name": "Python", "color": null, "size": 1, "percentage": 33.33},
        {"name": "TensorFlow", "color": null, "size": 1, "percentage": 33.33},
        {"name": "Streamlit", "color": null, "size": 1, "percentage": 33.34}
    ]'::jsonb,
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
    'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
    'https://github.com/cloudsync/realtime-chat',
    'github_1004',
    'realtime-chat',
    'cloudsync/realtime-chat',
    'Scalable realtime chat application.',
    '[
        {"name": "Go", "color": null, "size": 1, "percentage": 33.33},
        {"name": "Redis", "color": null, "size": 1, "percentage": 33.33},
        {"name": "WebSocket", "color": null, "size": 1, "percentage": 33.34}
    ]'::jsonb,
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
    'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb',
    'https://github.com/nexlabs/code-review-ai',
    'github_1005',
    'code-review-ai',
    'nexlabs/code-review-ai',
    'AI assistant for automated pull request reviews.',
    '[
        {"name": "Python", "color": null, "size": 1, "percentage": 33.33},
        {"name": "OpenAI", "color": null, "size": 1, "percentage": 33.33},
        {"name": "Docker", "color": null, "size": 1, "percentage": 33.34}
    ]'::jsonb,
    '["AI", "Code Review", "Automation"]',
    'Automated pull request analysis and smart review suggestions.',
    690,
    140,
    350,
    34000,
    470,
    120
)
ON CONFLICT (repo_id) DO NOTHING;

-- ─── Users (auth.users → public.users via trigger) ───────────────────────────

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'seeduser1@example.com',
    crypt('seedpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"user_name":"seeduser1","preferred_username":"seeduser1","provider_id":"github_seed_1","avatar_url":"https://avatars.githubusercontent.com/u/1001?v=4"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'seeduser2@example.com',
    crypt('seedpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"user_name":"seeduser2","preferred_username":"seeduser2","provider_id":"github_seed_2","avatar_url":"https://avatars.githubusercontent.com/u/1002?v=4"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '88888888-8888-8888-8888-888888888888',
    'authenticated',
    'authenticated',
    'seeduser3@example.com',
    crypt('seedpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"user_name":"seeduser3","preferred_username":"seeduser3","provider_id":"github_seed_3","avatar_url":"https://avatars.githubusercontent.com/u/1003?v=4"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

UPDATE public.users SET
    interests = '["AI", "Backend", "Productivity"]'::jsonb,
    saved_repos_count = 2
WHERE user_id = '22222222-2222-2222-2222-222222222222';

UPDATE public.users SET
    interests = '["Social", "Frontend", "TypeScript"]'::jsonb,
    saved_repos_count = 1
WHERE user_id = '55555555-5555-5555-5555-555555555555';

UPDATE public.users SET
    interests = '["ML", "Visualization", "Python"]'::jsonb,
    saved_repos_count = 1
WHERE user_id = '88888888-8888-8888-8888-888888888888';

-- ─── Follows (trigger maintains followers_count / following_count) ─────────

INSERT INTO public.follows (follower_id, following_id, created_at)
VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    '2026-06-01 09:00:00'
),
(
    '22222222-2222-2222-2222-222222222222',
    '88888888-8888-8888-8888-888888888888',
    '2026-06-01 09:30:00'
),
(
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    '2026-06-02 10:00:00'
),
(
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    '2026-06-03 14:00:00'
)
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- ─── Activity ───────────────────────────────────────────────────────────────

INSERT INTO activity (
    activity_id,
    user_id,
    repo_id,
    time_spent,
    likelihood_count,
    is_saved
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    INTERVAL '2 minutes 3 seconds',
    1,
    TRUE
),
(
    '12121212-1212-1212-1212-121212121212',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb',
    INTERVAL '5 minutes 12 seconds',
    1,
    TRUE
),
(
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    INTERVAL '10 minutes 4 seconds',
    -1,
    TRUE
),
(
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    INTERVAL '1 minute 9 seconds',
    0,
    TRUE
),
(
    '13131313-1313-1313-1313-131313131313',
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    INTERVAL '45 seconds',
    0,
    FALSE
),
(
    '14141414-1414-1414-1414-141414141414',
    '88888888-8888-8888-8888-888888888888',
    'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
    INTERVAL '3 minutes 20 seconds',
    -1,
    FALSE
)
ON CONFLICT (activity_id) DO NOTHING;

-- ─── Comments ───────────────────────────────────────────────────────────────

INSERT INTO comment (
    comment_id,
    user_id,
    repo_id,
    parent_comment_id,
    comment,
    created_at
)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    NULL,
    'This repository looks useful.',
    '2026-06-04 11:00:00'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Agreed, the structure is clean.',
    '2026-06-04 11:05:00'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    NULL,
    'Great visualization examples in the README.',
    '2026-06-05 08:30:00'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    NULL,
    'Perfect fit for our social discovery MVP.',
    '2026-06-05 12:00:00'
)
ON CONFLICT (comment_id) DO NOTHING;

-- ─── Boards ─────────────────────────────────────────────────────────────────

INSERT INTO boards (
    board_id,
    user_id,
    board_name,
    visibility,
    description,
    repos_count,
    created_at
)
VALUES
(
    'cccccccc-1111-1111-1111-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'Saved Repos',
    'public',
    'Primary board for saved repositories.',
    0,
    '2026-06-06 10:00:00'
),
(
    'cccccccc-2222-2222-2222-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'GitHub Repos',
    'public',
    'Curated GitHub repositories.',
    0,
    '2026-06-06 10:01:00'
),
(
    'cccccccc-3333-3333-3333-cccccccccccc',
    '55555555-5555-5555-5555-555555555555',
    'My Stack',
    'public',
    'Frontend and social dev tools.',
    0,
    '2026-06-06 11:00:00'
),
(
    'cccccccc-4444-4444-4444-cccccccccccc',
    '88888888-8888-8888-8888-888888888888',
    'ML Picks',
    'private',
    'Private machine learning repo collection.',
    0,
    '2026-06-06 12:00:00'
)
ON CONFLICT (board_id) DO NOTHING;

-- ─── Board repos (trigger enforces is_saved; trigger updates repos_count) ──

INSERT INTO board_repos (board_id, repo_id, added_at)
VALUES
(
    'cccccccc-1111-1111-1111-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    '2026-06-06 10:15:00'
),
(
    'cccccccc-1111-1111-1111-cccccccccccc',
    'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb',
    '2026-06-06 10:20:00'
),
(
    'cccccccc-2222-2222-2222-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    '2026-06-06 10:25:00'
),
(
    'cccccccc-3333-3333-3333-cccccccccccc',
    '66666666-6666-6666-6666-666666666666',
    '2026-06-06 11:10:00'
),
(
    'cccccccc-4444-4444-4444-cccccccccccc',
    '99999999-9999-9999-9999-999999999999',
    '2026-06-06 12:10:00'
)
ON CONFLICT (board_id, repo_id) DO NOTHING;

-- ─── Boards containers ──────────────────────────────────────────────────────

INSERT INTO boards_containers (
    container_id,
    user_id,
    container_name,
    description,
    created_at
)
VALUES
(
    'dddddddd-1111-1111-1111-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Default Boards Container',
    'Groups seeduser1 public boards.',
    '2026-06-07 09:00:00'
),
(
    'dddddddd-2222-2222-2222-dddddddddddd',
    '55555555-5555-5555-5555-555555555555',
    'Dev Boards',
    'Frontend and discovery boards.',
    '2026-06-07 09:30:00'
),
(
    'dddddddd-3333-3333-3333-dddddddddddd',
    '88888888-8888-8888-8888-888888888888',
    'Research Boards',
    'ML and visualization boards.',
    '2026-06-07 10:00:00'
)
ON CONFLICT (container_id) DO NOTHING;

-- ─── Container boards ───────────────────────────────────────────────────────

INSERT INTO container_boards (container_id, board_id, added_at)
VALUES
(
    'dddddddd-1111-1111-1111-dddddddddddd',
    'cccccccc-1111-1111-1111-cccccccccccc',
    '2026-06-07 09:05:00'
),
(
    'dddddddd-1111-1111-1111-dddddddddddd',
    'cccccccc-2222-2222-2222-cccccccccccc',
    '2026-06-07 09:06:00'
),
(
    'dddddddd-2222-2222-2222-dddddddddddd',
    'cccccccc-3333-3333-3333-cccccccccccc',
    '2026-06-07 09:35:00'
),
(
    'dddddddd-3333-3333-3333-dddddddddddd',
    'cccccccc-4444-4444-4444-cccccccccccc',
    '2026-06-07 10:05:00'
)
ON CONFLICT (container_id, board_id) DO NOTHING;
