var express = require('express');
var router = express.Router();
const { actionAbsenMasuk, actionCheckFace, } = require('./controller');
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
router.post('/masuk', authenticateToken, upload.single('file'), actionAbsenMasuk);
router.post('/check_face', authenticateToken, actionCheckFace);

module.exports = router;