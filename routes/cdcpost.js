const express = require('express');
const {
    getcdcPosts,
    createcdcPost,
    cdcpostsByUser,
    cdcpostById,
    isPoster,
    updatecdcPost,
    deletecdcPost,
    singlecdcPost,
} = require('../controllers/cdcpost');
const { requireSignin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { createPostValidator } = require('../validator');

const router = express.Router();

router.get('/cdcposts', getcdcPosts);

// post routes
router.post('/cdcpost/new/:userId', requireSignin, createcdcPost, createPostValidator);
router.get('/cdcposts/by/:userId', requireSignin, cdcpostsByUser);
router.get('/cdcpost/:cdcpostId', singlecdcPost);
router.put('/cdcpost/:cdcpostId', requireSignin, isPoster, updatecdcPost);
router.delete('/cdcpost/:cdcpostId', requireSignin, isPoster, deletecdcPost);

// any route containing :userId, our app will first execute userById()
router.param('userId', userById);
// any route containing :cdcpostId, our app will first execute cdcpostById()
router.param('cdcpostId', cdcpostById);

module.exports = router;