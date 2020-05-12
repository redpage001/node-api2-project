const express = require("express");

const Posts = require("./db");

const router = express.Router();

router.get("/", (req, res) => {
    Posts.find(req.query)
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: "The Posts information could not be retrieved."
            });
        });
});

router.get("/:id", (req, res) => {
    Posts.findById(req.params.id)
        .then(post => {
            if(post.length === 0) { 
                res.status(404).json({
                    message: "The post with the specified ID does not exist."
                });
            } else {
                res.status(200).json(post);
            }   
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "The post information could not be retrieved."
            });
        });
});

router.get("/:id/comments", (req, res) => {
    Posts.findPostComments(req.params.id)
        .then(comment => {
            if(comment.length === 0) {
                res.status(404).json({ 
                    message: "The post with the specified ID does not exist."
                });
            } else {
                res.status(200).json(comment);
            };
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "The comment information could not be retrieved."
            });
        });
});

router.post("/", (req, res) => {
    Posts.insert(req.body)
        .then(post => {
            const newPost = {
                ...post,
                ...req.body
            }
            if(!newPost.hasOwnProperty("title") || !newPost.hasOwnProperty("contents")){
                res.status(400).json({
                    message: "Please provide title and contents for the post."
                });
            } else {
                res.status(201).json(newPost);
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "There was an error while saving the post to the database."
            });
        });
});

router.post("/:id/comments", (req, res) => {
    let newComment = {...req.body, post_id: req.params.id}
    Posts.insertComment(newComment)
        .then(comment => {
            if(Posts.findById(req.params.id) && newComment.hasOwnProperty("text")){
                res.status(200).json(newComment)
            } else if(Posts.findById(req.params.id).length === 0){
                res.status(404).json({
                    message: "The post with the specified ID does not exist."
                });
            } else if(!newComment.hasOwnProperty("text")){
                res.status(400).json({
                    message: "Please provide text for the comment."
                })
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "There was an error while saving the comment to the database."
            });
        });
});

router.delete("/:id", (req, res) => {
    Posts.findById(req.params.id)
         .then(post => {
             if(post.length > 0){
                 Posts.remove(req.params.id)
                      .then(post => {
                          res.status(200)
                      })
                      .catch(error => {
                         console.log({ error })
                         res.status(500).json({ 
                             message: "The post could not be removed." 
                        })
                      })
                res.json(post)
             }else if(post.length === 0){
                 res.status(404).json({ message: 
                    "The post with the specified ID does not exist." 
                })
             }
         })
         .catch(error => {
            console.log({ error })
             res.status(500).json({ 
                 message: "The post information could not be retrieved." 
            })
         })
})

router.put("/:id", (req, res) => {
    Posts.update(req.params.id, req.body)
         .then(post => {
             if(Posts.findById(req.params.id) && req.body.hasOwnProperty("title") && req.body.hasOwnProperty("contents")){
                res.status(200).json(req.body)
             }else if(Posts.findById(req.params.id).length === 0){
                 res.status(404).json({ 
                     message: "The post with the specified ID does not exist." 
                })
             }else if(!req.body.hasOwnProperty("title") || !req.body.hasOwnProperty("contents")){
                 res.status(400).json({ 
                     message: "Please provide title and contents for the post." 
                })
             }
         })
         .catch(error => {
            console.log({ error })
            res.status(500).json({ 
                message: "The post information could not be modified." 
            })
         })
})

module.exports = router;