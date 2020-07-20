const bcrypt = require('bcrypt');
const passport = require('passport');

module.exports = (app, db) => {
  app.route('/').get((req, res) => {
    //Change the response to render the Pug template
    // res.send(`Pug template is not defined.`);
    res.render(process.cwd() + '/views/pug/index', {
      title: 'Home Page',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
    });
  });

  app.post(
    '/login',
    passport.authenticate('local', { failureRedirect: '/' }),
    async (req, res) => {
      res.render(process.cwd() + '/views/pug/profile', {
        username: req.user.username,
      });
    }
  );

  app.route('/register').post(
    (req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function (
        err,
        user
      ) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          const hashed = bcrypt.hashSync(req.body.password, 12);

          db.collection('users').insertOne(
            { username: req.body.username, password: hashed },
            (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                next(null, user);
              }
            }
          );
        }
      });
    },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile', {
      username: req.user.username,
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // handle missing pages
  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });
};

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
