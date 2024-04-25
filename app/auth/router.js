var express = require('express');
var router = express.Router();
const { actionSignin, } = require('./controller');
// const { authenticateToken } = require('../../middleware/middleware');

router.post('/login', actionSignin);

module.exports = router;