const spicedPg = require("spiced-pg");
// **SUDO SERVICE POSTGRESQL START**
//to run Heroku
let db;

db = spicedPg(`postgres:postgres:Pernia1985@localhost:5432/images`);

exports.getImages = function() {
    return db
        .query(
            `SELECT url, username, title, description, id
            FROM images
            ORDER BY created_at DESC
            LIMIT 6`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.addImages = function(url, title, username, description) {
    return db
        .query(
            `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [url, title, username, description]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getMoreImages = function(lastId) {
    return db
        .query(
            `SELECT *, (
                SELECT id
                FROM images
                ORDER BY id ASC
                LIMIT 1
            ) AS "lowestId" FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 6`,
            [lastId]
        )
        .then(({ rows }) => rows);
};

exports.getDetail = function(id) {
    return db
        .query(`SELECT * FROM images WHERE id = $1`, [id])
        .then(({ rows }) => {
            return rows;
        });
};

exports.addComment = function(comment, username, image_id) {
    return db
        .query(
            `INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3) RETURNING *`,
            [comment, username, image_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getComments = function(id) {
    return db
        .query(
            `SELECT * FROM comments WHERE image_id = $1 ORDER BY created_at DESC`,
            [id]
        )
        .then(({ rows }) => {
            return rows;
        });
};
