var express = require('express');
var router = express.Router();
const { actionAbsen, actionCheckFace, checkPresensi, actionAbsenMasuk, actionAbsenPulang, getPresensiUser, } = require('./controller');
const { jwtToSession, authenticateToken } = require('../../middleware/middleware');
const multer = require('multer');

// Define the storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename for the uploaded file
    }
});

const upload = multer({ dest: 'uploads/', storage: storage });

router.use(jwtToSession);
router.post('/', authenticateToken, upload.single('file'), actionAbsenMasuk);
router.post('/pulang', authenticateToken, actionAbsenPulang);
router.post('/check_face', authenticateToken, actionCheckFace);
router.get('/check_presensi', authenticateToken, checkPresensi);
router.get('/presensi_user', authenticateToken, getPresensiUser);

module.exports = router;