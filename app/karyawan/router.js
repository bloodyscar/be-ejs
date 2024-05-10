var express = require('express');
const { getAllKaryawan, getRole, inputKaryawan, editKaryawan, deleteKaryawan } = require('./controller');
const { webJwtToSession } = require('../../middleware/middleware');
var router = express.Router();

router.use(webJwtToSession);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render("layout/karyawan/view", { currentPage: 'Karyawan' });
});
router.get('/karyawan', getAllKaryawan);
router.get('/role', getRole);
router.post('/input_karyawan', inputKaryawan);
router.post('/edit_karyawan', editKaryawan);
router.post('/delete_karyawan', deleteKaryawan);

module.exports = router;
