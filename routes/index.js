var express = require('express');
var router = express.Router();
var expressSession = require('express-session');

var users = require('../controllers/users_controller');
console.log("before / Route");
router.get('/', function(req, res){
    console.log("/ Route");
//    console.log(req);
    console.log(req.session);
    if (req.session.user) {
      console.log("/ Route if user");
      console.log("HEY", req.session.pendingFRs);
      res.render('index', {username: req.session.username,
                           msg:req.session.msg,
                           color:req.session.color,
                           imgurl:req.session.imgurl,
                           bio:req.session.bio,
                           pendingFRs: req.session.pendingFRs});
    } else {
      console.log("/ Route else user");
      req.session.msg = 'Access denied!';
      res.redirect('/login');
    }
});
router.get('/site/:username', users.userSite);
router.post('/site/:username/sendFR', users.sendFR);
router.post('/user/acceptFR/:frFrom', users.acceptFR);
router.post('/user/rejectFR/:frFrom', users.rejectFR);

router.get('/user', function(req, res){
    console.log("/user Route");
    if (req.session.user) {
      res.render('user', {pendingFRs: req.session.pendingFRs, username: req.session.username, imgurl: req.session.imgurl, bio: req.session.bio, msg:req.session.msg});
    } else {
      req.session.msg = 'Access denied!';
      res.redirect('/login');
    }
});
router.get('/signup', function(req, res){
    console.log("/signup Route");
    if(req.session.user){
      res.redirect('/');
    }
    res.render('signup', {msg:req.session.msg});
});
router.get('/login',  function(req, res){
    console.log("/login Route");
    if(req.session.user){
      res.redirect('/');
    }
    res.render('login', {msg:req.session.msg});
});
router.get('/logout', function(req, res){
    console.log("/logout Route");
    req.session.destroy(function(){
      res.redirect('/login');
    });
  });
router.post('/signup', users.signup);
router.post('/user/update', users.updateUser);
router.post('/user/delete', users.deleteUser);
router.post('/login', users.login);
router.get('/user/profile', users.getUserProfile);
router.get('/allusers', users.userList);

module.exports = router;
