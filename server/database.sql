CREATE DATABASE spring;

\c spring -- Connect to the newly created database

CREATE TABLE main (
    id SERIAL PRIMARY KEY,  -- "id" instead of "main" as the primary key column
    description VARCHAR(255) -- No semicolon here, it's just a column definition
);
