/*
** Check the role of a user
*/
module.exports = function (req, res, role, next) {
	req.execute('isRole', role, next);
};