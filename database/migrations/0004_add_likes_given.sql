-- Migration: Add likes_given_count to users and create trigger

-- 1. Add the column
ALTER TABLE users ADD COLUMN IF NOT EXISTS likes_given_count INT DEFAULT 0;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION update_user_likes_given_count() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE target_user_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN target_user_id := NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN target_user_id := NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN target_user_id := OLD.user_id;
  END IF;
  
  UPDATE users 
  SET likes_given_count = (SELECT COUNT(*) FROM activity WHERE user_id = target_user_id AND likelihood_count = 1) 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Attach the trigger to the activity table
DROP TRIGGER IF EXISTS trg_user_likes_given_count ON activity;
CREATE TRIGGER trg_user_likes_given_count 
AFTER INSERT OR UPDATE OR DELETE ON activity 
FOR EACH ROW EXECUTE FUNCTION update_user_likes_given_count();
