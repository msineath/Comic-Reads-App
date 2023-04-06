const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../db/models');
const { Shelf, Comic, User, Library} = db;
const { csrfProtection, asyncHandler } = require('./utils');
const bcrypt = require('bcryptjs');

const { loginUser, logoutUser, requireAuth } = require('../auth');

router.get('/user/register', csrfProtection, (req, res) => {
  const user = User.build();
  if (res.locals.authenticated) {
    return res.redirect('/')
  }

  res.render('user-register', {
    title: 'Register',
    user,
    csrfToken: req.csrfToken(),
  });
});

router.get('/user/:id(\\d+)', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userShelves = await Shelf.findAll({where:{userId: id}, include: Comic})
  res.render('user-profile', {userShelves});
}));

router.post('/user/:id(\\d+)', requireAuth, asyncHandler( async (req, res) => {
  const {shelfButtonId}  = req.body;
  await Library.create({
    shelfId : 3,
    comicId: shelfButtonId
});
  res.json({"key" : "comic added"});
}));

router.delete('/user/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
  //grabbing the comic ID by the removeShelfButton id
  const removeShelfButtonId = req.body.removeShelfButtonId
  const name = req.body.shelfName
  const currentShelf = await Shelf.findOne({where: {name}});

  await Library.destroy({where: {shelfId: currentShelf.id, comicId: removeShelfButtonId}});
  res.json({"key" : "comic removed"});

}));

router.post('/user/demo', asyncHandler(async (req, res) => {
  if (res.locals.authenticated) {
    res.redirect('/')
  }
  const { emailAddress } = req.body;
  const user = await User.findOne({ where: { emailAddress } });
  loginUser(req, res, user);
  res.redirect('/')
}));

const userValidators = [
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for First Name')
    .isLength({ max: 50 })
    .withMessage('First Name must not be more than 50 characters long'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Last Name')
    .isLength({ max: 50 })
    .withMessage('Last Name must not be more than 50 characters long'),
  check('emailAddress')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Email Address')
    .isLength({ max: 255 })
    .withMessage('Email Address must not be more than 255 characters long')
    .isEmail()
    .withMessage('Email Address is not a valid email')
    .custom((value) => {
      return User.findOne({ where: { emailAddress: value } })
        .then((user) => {
          if (user) {
            return Promise.reject('The provided Email Address is already in use by another account');
          }
        });
    }),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Password')
    .isLength({ max: 50 })
    .withMessage('Password must not be more than 50 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'g')
    .withMessage('Password must contain at least 1 lowercase letter, uppercase letter, number, and special character (i.e. "!@#$%^&*")'),
  check('confirmPassword')
  .exists({ checkFalsy: true })
  .withMessage('Please provide a value for Confirm Password')
  .isLength({ max: 50 })
  .withMessage('Confirm Password must not be more than 50 characters long')
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm Password does not match Password');
    }
    return true;
  })
];

router.post('/user/register', csrfProtection, userValidators,
  asyncHandler(async (req, res) => {
    const {
      emailAddress,
      firstName,
      lastName,
      password,
    } = req.body;

    const user = User.build({
      emailAddress,
      firstName,
      lastName,
    });

    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.hashedPassword = hashedPassword;
      await user.save();
      const userId = user.id
      const shelf = Shelf.build({
        name: 'My-shelf',
        userId: userId,
        isRecommended: false
      });
      await shelf.save();


      loginUser(req, res, user);
      res.redirect('/');
    } else {
      const errors = validatorErrors.array().map((error) => error.msg);
      res.render('user-register', {
        title: 'Register',
        user,
        errors,
        csrfToken: req.csrfToken(),
      });
    }
  }));

//LOGIN ROUTES
  router.get('/user/login', csrfProtection, (req, res) => {
    if (res.locals.authenticated) {
      res.redirect('/')
    }
    res.render('user-login', {
      title: 'Login',
      csrfToken: req.csrfToken(),
    });
  });

  const loginValidators = [
    check('emailAddress')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a value for Email Address'),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a value for Password'),
  ];
  //
  router.post('/user/login', csrfProtection, loginValidators,
  asyncHandler(async (req, res) => {
    const {
      emailAddress,
      password,

    } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
      // Attempt to get the user by their email address.
      const user = await User.findOne({ where: { emailAddress } });

      if (user !== null) {
        // If the user exists then compare their password
        // to the provided password.
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword.toString());

        if (passwordMatch) {
          // If the password hashes match, then login the user
          // and redirect them to the default route.
          // TODO Login the user.
          loginUser(req, res, user);
          return res.redirect('/');
        }
      }

      // Otherwise display an error message to the user.
      errors.push('Login failed for the provided email address and password');
    } else {
      errors = validatorErrors.array().map((error) => error.msg);
    }
    res.render('user-login', {
      title: 'Login',
      emailAddress,
      errors,
      csrfToken: req.csrfToken(),
    });
  }));

  router.post('/user/logout',(req, res) => {
    logoutUser(req, res);
    res.redirect('/user/login');
  });


module.exports = router;
