// import express from 'express';
// import bcrypt from 'bcryptjs';
// import moment from 'moment';

// import userService from '../services/user.service.js';

// const router = express.Router();

// router.get('/register', function (req, res) {
//   res.render('vwAccount/register');
// });

// router.post('/register', async function (req, res) {
//   const hash_password = bcrypt.hashSync(req.body.raw_password, 8);
//   // const ymd_dob = req.body.raw_dob; // yyyy-mm-dd
//   const ymd_dob = moment(req.body.raw_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
//   const entity = {
//     username: req.body.username,
//     password: hash_password,
//     name: req.body.name,
//     email: req.body.email,
//     dob: ymd_dob,
//     permission: 0,
//   }
//   const ret = await userService.add(entity);
//   res.render('vwAccount/register');
// });

// router.get('/login', function (req, res) {
//   res.render('vwAccount/login');
// });

// router.post('/login', async function (req, res) {
//   const user = await userService.findByUsername(req.body.username);
//   if (!user) {
//     return res.render('vwAccount/login', {
//       has_errors: true,
//     });
//   }

//   const ret = bcrypt.compareSync(req.body.password, user.password);
//   if (!ret) {
//     return res.render('vwAccount/login', {
//       has_errors: true,
//     });
//   }

//   req.session.auth = true;
//   req.session.authUser = user;

//   const retUrl = req.session.retUrl || '/';
//   req.session.retUrl = null;
//   res.redirect(retUrl); // login successfully
// });

// router.get('/is-available', async function (req, res) {
//   const username = req.query.username;
//   const user = await userService.findByUsername(username);
//   if (!user) {
//     return res.json(true);
//   }
//   res.json(false);
// });

// import { isAuth } from '../middlewares/auth.mdw.js';

// router.get('/profile', isAuth, function (req, res) {
//   res.render('vwAccount/profile', {
//     user: req.session.authUser,
//   });
// });

// router.get('/update-password', isAuth, function (req, res) {
//   res.render('vwAccount/update-password');
// });

// router.post('/logout', isAuth, function (req, res) {
//   req.session.auth = false;
//   req.session.authUser = null;
//   req.session.retUrl = null;
//   res.redirect('/');
// });

// export default router;