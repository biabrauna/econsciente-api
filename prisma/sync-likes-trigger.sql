-- Migration to add triggers for synchronizing Posts.curtidas with UserLike count
-- This ensures the counter is always accurate

-- Step 1: First, fix any existing inconsistencies
UPDATE posts
SET curtidas = (
  SELECT COUNT(*)
  FROM user_likes
  WHERE user_likes."postId" = posts.id
);

-- Step 2: Create function to sync likes counter when UserLike is inserted
CREATE OR REPLACE FUNCTION sync_likes_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET curtidas = (
    SELECT COUNT(*)
    FROM user_likes
    WHERE "postId" = NEW."postId"
  )
  WHERE id = NEW."postId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create function to sync likes counter when UserLike is deleted
CREATE OR REPLACE FUNCTION sync_likes_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET curtidas = (
    SELECT COUNT(*)
    FROM user_likes
    WHERE "postId" = OLD."postId"
  )
  WHERE id = OLD."postId";
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for INSERT on user_likes
DROP TRIGGER IF EXISTS trigger_sync_likes_insert ON user_likes;
CREATE TRIGGER trigger_sync_likes_insert
AFTER INSERT ON user_likes
FOR EACH ROW
EXECUTE FUNCTION sync_likes_on_insert();

-- Step 5: Create trigger for DELETE on user_likes
DROP TRIGGER IF EXISTS trigger_sync_likes_delete ON user_likes;
CREATE TRIGGER trigger_sync_likes_delete
AFTER DELETE ON user_likes
FOR EACH ROW
EXECUTE FUNCTION sync_likes_on_delete();

-- Step 6: Add a check constraint to ensure curtidas is never negative
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_curtidas_non_negative;

ALTER TABLE posts
ADD CONSTRAINT posts_curtidas_non_negative
CHECK (curtidas >= 0);
