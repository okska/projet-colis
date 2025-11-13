CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL
);

INSERT INTO posts (title, body) VALUES
('Post 1 from DB', 'This is the body of post 1'),
('Post 2 from DB', 'This is the body of post 2'),
('Post 3 from DB', 'This is the body of post 3');
