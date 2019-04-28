var AdminDao = require('../daos/AdminUserDao');

var checkIsAdmin = async function(req){
    await AdminDao.findByToken(req.query.adminToken);
};

module.exports = {
    checkIsAdmin: checkIsAdmin
};