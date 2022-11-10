DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature VARCHAR NOT NULL CHECK (signature != ''),
    user_id VARCHAR(50) NOT NULL
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL
);