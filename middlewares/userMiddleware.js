exports.userIdParam = (req,res,next,id) => {
    req.userId = id;
    next();
};