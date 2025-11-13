CREATE OR REPLACE FUNCTION get_post_and_log(post_id INT)
RETURNS TABLE(id INT, title VARCHAR, body TEXT) AS $$
BEGIN
    RAISE NOTICE 'Fetching post with id: %', post_id;

    -- Some dummy logic to debug
    IF post_id < 0 THEN
        RAISE WARNING 'Post ID is negative, this might not be intended.';
    END IF;

    RAISE NOTICE 'Querying the posts table...';

    RETURN QUERY
    SELECT p.id, p.title, p.body FROM posts AS p
    WHERE p.id = post_id;

    RAISE NOTICE 'Finished fetching post.';
END;
$$ LANGUAGE plpgsql;
