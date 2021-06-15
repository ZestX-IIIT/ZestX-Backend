exports.userIdParam = (req, res, next, token) => {
  req.userToken = token;
  next();
};
