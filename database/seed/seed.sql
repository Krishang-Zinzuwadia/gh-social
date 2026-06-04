INSERT INTO activity (
    activity_id,
    user_id,
    repo_id,
    time_spent,
    likelihood_count,
    is_saved
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '2026-06-04 10:00:00',
    1,
    TRUE
),
(
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '2026-06-04 10:15:00',
    -1,
    FALSE
),
(
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    '2026-06-04 10:30:00',
    0,
    FALSE
);

INSERT INTO comment (
    comment_id,
    user_id,
    repo_id,
    parent_comment_id,
    comment,
    created_at
) VALUES
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
);
