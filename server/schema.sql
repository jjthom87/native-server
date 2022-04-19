CREATE DATABASE recommendations;
USE recommendations;

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL
);

CREATE TABLE places (
	place TEXT,
	place_id TEXT,
	user_id INT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id)
);
