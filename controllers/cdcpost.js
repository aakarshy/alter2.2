const Post = require('../models/cdcpost');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

exports.cdcpostById = (req, res, next, id) => {
    Post.findById(id)
        .populate('postedBy', '_id name role')
        .select('_id title body created')
        .exec((err, post) => {
            if (err || !post) {
                return res.status(400).json({
                    error: err
                });
            }
            req.post = post;
            next();
        });
};


/*
exports.getPosts = (req, res) => {
    const posts = Post.find()
        .populate("postedBy", "_id name")
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id name")
        .select("_id title body created likes")
        .sort({ created: -1 })
        .then(posts => {
            res.json(posts);
        })
        .catch(err => console.log(err));
};
*/

// with pagination
exports.getcdcPosts = async (req, res) => {
    // get current page from req.query or use default value of 1
    const currentPage = req.query.page || 1;
    // return 3 posts per page
    const perPage = 12;
    let totalItems;

    const posts = await Post.find()
        // countDocuments() gives you total count of posts
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .populate('postedBy', '_id name')
                .select('_id title body created')
                .limit(perPage)
                .sort({ created: -1 });
        })
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => console.log(err));
};

exports.createcdcPost = (req, res) => {
    const {title, body} = req.body

    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;

    let post = new Post(req.body);
    post.postedBy = req.profile;

    post.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json(result);
    });
};

exports.cdcpostsByUser = (req, res) => {
    cdcPost.find({ postedBy: req.profile._id })
        .populate('postedBy', '_id name')
        .select('_id title body created')
        .sort('_created')
        .exec((err, posts) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(posts);
        });
};

exports.isPoster = (req, res, next) => {
    let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
    let adminUser = req.post && req.auth && req.auth.role === 'admin';

    // console.log("req.post ", req.post, " req.auth ", req.auth);
    // console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

    let isPoster = sameUser || adminUser;

    if (!isPoster) {
        return res.status(403).json({
            error: 'User is not authorized'
        });
    }
    next();
};

// exports.updatePost = (req, res, next) => {
//     let post = req.post;
//     post = _.extend(post, req.body);
//     post.updated = Date.now();
//     post.save(err => {
//         if (err) {
//             return res.status(400).json({
//                 error: err
//             });
//         }
//         res.json(post);
//     });
// };

exports.updatecdcPost = (req, res, next) => {
    const{title, body} = req.body;
    // save post
    let post = req.post;
    post = _.extend(post, req.body);
    post.updated = Date.now();
    post.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json(post);
    });
};

exports.deletecdcPost = (req, res) => {
    let post = req.post;
    post.remove((err, post) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({
            message: 'Post deleted successfully'
        });
    });
};

exports.singlecdcPost = (req, res) => {
    return res.json(req.post);
};
