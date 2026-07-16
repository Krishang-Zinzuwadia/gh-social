ALTER TABLE telemetry.feed_serves
ADD COLUMN IF NOT EXISTS next_cursor text;
