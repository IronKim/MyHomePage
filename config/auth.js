var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    User = require('../models/User');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    process.nextTick(function () {
      User.findOne({email: email}, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash('danger', '존재하지 않는 사용자입니다.'));
        }
        if (!user.validatePassword(password)) {
          return done(null, false, req.flash('danger', '비밀번호가 일치하지 않습니다.'));
        }
        return done(null, user, req.flash('success', '로그인되었습니다.'));
      });
    });
  }));




  passport.use(new GoogleStrategy({
    clientID        : '769461459037-o3phki7bc9ch8sljcbckrj50dlipn9i3.apps.googleusercontent.com',
    clientSecret    : 'Tirev4yvUYp0ovs38d5wDNac',
    callbackURL     : 'http://localhost:3000/auth/google/callback',
  },   function(token, refreshToken, profile, done) {
    console.log(profile);
    var email = profile.emails[0].value;
    process.nextTick(function() {
      User.findOne({ 'google.id' : profile.id }, function(err, user) {
        if (err)
          return done(err);
        if (user) {
          return done(null, user);
        } else {
          User.findOne({email: email}, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value
              });
            }
            user.google.id = profile.id;
            user.google.token = profile.token;
            user.google.photo = profile.photos[0].value;
            user.save(function(err) {
              if (err) {
                return done(err);
              }
              return done(null, user);
            });
          });
        }
      });
    });
  }));

  passport.use(new FacebookStrategy({
    clientID : '1520673334895238',
    clientSecret : '2aa06b1cfbee1a12c086a60c8295cd80',    //App Secret으로 체워넣으세요.
    callbackURL : 'http://localhost:3000/auth/facebook/callback',
    profileFields : ["emails", "displayName", "name", "photos"]
  }, function(token, refreshToken, profile, done) {
    console.log(profile);
    var email = profile.emails[0].value;
    process.nextTick(function () {
      User.findOne({'facebook.id': profile.id}, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, user);
        } else {
          User.findOne({email: email}, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value
              });
            }
            user.facebook.id = profile.id;
            user.facebook.token = profile.token;
            user.facebook.photo = profile.photos[0].value;
            user.save(function(err) {
              if (err) {
                return done(err);
              }
              return done(null, user);
            });
          });
        }
      });
    });
  }));
};
