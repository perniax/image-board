const express = require("express");
const app = express();
const s3 = require("./s3");
const config = require("./config");

const db = require("./utils/db");
//*********************FILE UPLOAD BOILERPLATE**********************
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//*********************FILE UPLOAD BOILERPLATE********************
app.use(express.json());

//*********************FILE UPLOAD BOILERPLATE********************

app.use(express.static("public"));

app.get("/registration", (req, res) => {
    db.getImages()
        .then(img => {
            console.log(" result from getImage: ", img);

            res.json(img);
        })
        .catch(e => {
            console.log("error from getImage:", e);
        });
});

app.get("/getmore/:id", (req, res) => {
    const id = req.params.id;
    console.log("id: ", id);
    db.getMoreImages(id)
        .then(pics => {
            console.log("result from getMoreImages: ", pics);
            res.json(pics);
        })
        .catch(e => {
            console.log("error in getMoreImages: ", e);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { filename } = req.file;
    const url = config.s3Url + filename;
    console.log("url from app.post /upload: ", url);
    console.log("config: ", config);
    const { title, username, description } = req.body;
    //now we make the insert in the db, pasing the 3 new consts filename, url, title, username, description;
    //we display once is in the S3
    //unshift(images) into the images[], so the newest comes first (not push, does the oppposite)
    //req.file --> the file that was just uploaded
    //req.body --> referes to the values we type in the input fields
    if (req.file) {
        console.log("url before addImage:", url);
        db.addImages(url, username, title, description)
            .then(result => {
                console.log("result from addImages: ", result);
                console.log("result[0]", result[0]);
                // imgs.unshift(result);
                res.json(result[0]);
            })
            .catch(err => {
                console.log("error from addImages in /upload POST: ", err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get("/detail/:imageId", (req, res) => {
    const id = req.params.imageId;
    console.log("id: ", id);
    console.log("req.params.imageId: ", req.params.imageId);
    db.getDetail(id)
        .then(result => {
            console.log(" result from getImage for /detail: ", result);

            res.json(result[0]);
        })
        .catch(e => {
            console.log("error from getDetail:", e);
        });
});

app.get("/comments/:imageId", (req, res) => {
    const id = req.params.imageId;
    console.log("req.params.imageId in get comments: ", req.params.imageId);
    console.log("id in get comments in index: ", id);
    db.getComments(id)
        .then(result => {
            console.log("result from getComments: ", result);
            res.json(result);
        })
        .catch(e => {
            console.log("error from getComments: ", e);
        });
});

// here we have to first define on the axio.post the body
app.post("/comments", (req, res) => {
    const { comment, username, id } = req.body;
    console.log("req.body in post comment: ", req.body);
    console.log("username: ", username);
    console.log("req.body.username: ", req.body.username);
    db.addComment(comment, username, id)
        .then(result => {
            console.log("result from addComment:", result);
            res.json(result[0]);
        })
        .catch(e => {
            console.log("error from addComment:", e);
        });
});

app.listen(8080, () => console.log("My image board server is UP!"));
