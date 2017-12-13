var crypto = require('crypto');
var mongoose = require('mongoose'),
    User = mongoose.model('User');
function hashPW(pwd){
  return crypto.createHash('sha256').update(pwd).
         digest('base64').toString();
}
exports.signup = function(req, res){
  console.log("Begin exports.signup");
  var user = new User({username:req.body.username});
  console.log("after new user exports.signup");
  user.set('hashed_password', hashPW(req.body.password));
  console.log("after hashing user exports.signup");
  user.set('email', req.body.email);
  console.log("after email user exports.signup");
  user.save(function(err) {
    console.log("In exports.signup");
    console.log(err);
    if (err){
      res.session.error = err;
      res.redirect('/signup');
    } else {
      req.session.user = user.id;
      req.session.username = user.username;
      req.session.msg = 'Authenticated as ' + user.username;
      res.redirect('/');
    }
  });
};
exports.acceptFR = function(req, res) {
  var frFrom = req.params.frFrom;
  var frTo = req.session.username;
  User.findOne({ _id: req.session.user})
   .exec(function(err, user){
     user.pull({'pendingFRs': frFrom});
     user.push({'friends': frFrom});
     user.save(function(err){
       if(err){
         console.log("ERROR ACCEPTING FR");
         res.session.error = err;
       } else {
         req.session.friends = user.friends;
         req.session.pendingFRs = user.pendingFRs;
       };
       res.redirect('/user');
     });
  });
}
exports.rejectFR = function(req, res) {
  var frFrom = req.params.frFrom;
  var frTo = req.session.username;
  User.findOne({_id: req.session.user})
    .exec(function(err, user){
      user.pull({'pendingFRs': frFrom});
      user.save(function(err){
        if(err){
          req.session.error = err;
          console.log("ERROR REMOVING FROM PENDINGFRs");
        } else {
         req.session.pendingFRs = user.pendingFRs;
        };
      res.redirect('/user');
    });
  });
}

exports.sendFR = function(req, res) {
  var frFrom = req.session.username;
  var frTo = req.params.username;
  console.log("SEND FR", frFrom, " to: ", frTo); 
  var query = {'username': frTo};
  var update = {$push: {'pendingFRs': frFrom}};
  User.findOneAndUpdate(query, update, function(err, doc){
    if(err){
      console.log("ERROR UPDATING PENDINGFRs");
    }
    console.log(doc);
  });
  res.redirect("/site/"+ frTo + "/");
}

exports.userSite = function(req, res) {
  if(req.params.username == req.session.username){
    console.log("SAME USER");
    res.redirect('/user');
  } else {
    User.findOne({ username: req.params.username})
      .exec(function(err, user) {
      if(!user){
        res.json(404, {err: "User not Found."});
      }else {
        res.render('profile', {bio: user.bio, username: user.username, imgurl: user.imgurl});
      }
    });
  }
};
exports.login = function(req, res){
  User.findOne({ username: req.body.username })
  .exec(function(err, user) {
    if (!user){
      err = 'User Not Found.';
    } else if (user.hashed_password ===
               hashPW(req.body.password.toString())) {
      req.session.regenerate(function(){
        console.log("login");
        console.log(user);
        req.session.user = user.id;
        req.session.username = user.username;
        req.session.msg = 'Authenticated as ' + user.username;
        req.session.color = user.color;
        req.session.bio = user.bio;
        req.session.imgurl = user.imgurl;
        req.session.pendingFRs = user.pendingFRs;
        req.session.friends = user.friends;
        res.redirect('/');
      });
    }else{
      err = 'Authentication failed.';
    }
    if(err){
      req.session.regenerate(function(){
        req.session.msg = err;
        res.redirect('/login');
      });
    }
  });
};
exports.getUserProfile = function(req, res) {
  User.findOne({ _id: req.session.user })
  .exec(function(err, user) {
    if (!user){
      res.json(404, {err: 'User Not Found.'});
    } else {
      res.json(user);
    }
  });
};
exports.updateUser = function(req, res){
  User.findOne({ _id: req.session.user })
  .exec(function(err, user) {
    user.set('email', req.body.email);
    user.set('color', req.body.color);
    user.set('imgurl', req.body.imgurl);
    user.set('bio', req.body.bio);
    user.save(function(err) {
      if (err){
        res.sessor.error = err;
      } else {
        req.session.msg = 'User Updated.';
        req.session.color = req.body.color;
        req.session.bio = req.body.bio;
        req.session.imgurl = req.body.imgurl;
      }
      res.redirect('/user');
    });
  });
};
exports.deleteUser = function(req, res){
  User.findOne({ _id: req.session.user })
  .exec(function(err, user) {
    if(user){
      user.remove(function(err){
        if (err){
          req.session.msg = err;
        }
        req.session.destroy(function(){
          res.redirect('/login');
        });
      });
    } else{
      req.session.msg = "User Not Found!";
      req.session.destroy(function(){
        res.redirect('/login');
      });
    }
  });
};
exports.userList = function(req, res){
  User.find()
  .exec(function(err, accounts) {
    if(accounts){
      req.session.users = accounts;
      res.json(accounts);
    } else {
      res.json(404, {err:"No users found"});
      req.session.msg = "No users found!";
      };
  });
};    
