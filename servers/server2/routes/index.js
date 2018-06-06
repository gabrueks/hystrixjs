var express = require('express');
var router = express.Router();
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

/* GET home page. */
router.post('/', function(req, res, next) {
    res.json({server : '2'})
});

module.exports = router;
