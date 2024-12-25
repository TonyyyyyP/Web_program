const express = require('express');
const passport = require('passport');
const authController = require('../Controller/authController');

const router = express.Router();

router.get('/auth/github', authController.githubLogin);
router.get('/auth/github/callback', authController.githubCallback,function(req, res) {
    res.redirect('/');
}) ;
router.get('/logout', authController.logout);


module.exports = router;


/// tạo button đăng nhập bằng github với link to /auth/github