var moment = require('moment');

var middleware = (req, res, next) => {
    var start = moment();
    res.on('finish', () => {
        console.log(res.statusCode);
        console.log(req.method);
        console.log(req.originalUrl);
        console.log(req.originalUrl.includes('adminToken='));
        var end = moment();
        console.log(end - start);
        if (res.error){
            console.log(res.error.name);
        }
        console.log(req.originalUrl.split('/')[1].split('?')[0]);
        console.log(moment().format());
    });

    next();
}

module.exports = middleware;