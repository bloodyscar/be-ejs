var express = require('express');
var router = express.Router();
const { webJwtToSession } = require('../../middleware/middleware');

router.use(webJwtToSession);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render("layout/dashboard/view", { currentPage: 'Dashboard' });
});

module.exports = router;
