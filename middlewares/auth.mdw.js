export function isAuth(req, res, next) {
  if (!req.session.auth) {
    req.session.retUrl = req.originalUrl; // lưu lại url hiện tại trước khi kick user
    return res.redirect('/account/login');
  }
  next();
}

export function isAdmin(req, res, next) {
  if (req.session.authUser.permission < 1) {
    return res.render('403');
  }
  next();
}