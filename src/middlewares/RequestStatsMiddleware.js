var RequestStatsDao = require('../daos/RequestStatsDao');

var middleware = async (req, res, next) => {
    var start = Date.now();

    res.on('finish', () => {
        var end = Date.now();

        var requestData = {
            method: req.method,
            statusCode: res.statusCode,
            resource: res.statusCode == 404 ? 'unknown' : req.originalUrl.split('/')[1].split('?')[0],
            isAdmin: req.originalUrl.includes('adminToken=') && res.statusCode != 401,
            responseTime: end - start,
            error: res.error ? res.error.name : null
        };

        RequestStatsDao.save(requestData);
    });

    next();
};

module.exports = middleware;