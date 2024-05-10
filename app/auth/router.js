var express = require('express');
var router = express.Router();
const { actionSignin, viewSignin, signinAdmin, } = require('./controller');
// const { authenticateToken } = require('../../middleware/middleware');

router.post('/login', actionSignin);
router.get('/login', viewSignin);
router.post('/login_admin', signinAdmin);

module.exports = router;