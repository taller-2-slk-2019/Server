var AdminDao = require('../daos/AdminUserDao');

var checkIsAdmin = async function(req){
    await AdminDao.findByToken(req.get('adminToken'));
};

module.exports = {
    checkIsAdmin: checkIsAdmin
};