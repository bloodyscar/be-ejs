var express = require('express');
var router = express.Router();
const { getAllPresensi, cetakExcelByFilter, editPresensi } = require('./controller');
const { webJwtToSession } = require('../../middleware/middleware');

router.use(webJwtToSession);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render("layout/presensi/view", { currentPage: 'Presensi' });
});
router.get('/getAllPresensi', getAllPresensi);
router.post('/cetak_excel', cetakExcelByFilter);
router.post('/edit_presensi', editPresensi);

module.exports = router;
