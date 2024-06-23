
require('dotenv').config();
var express = require('express');
var router = express.Router();
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path')
const axios = require('axios')
const moment = require('moment')


module.exports = {
    getTotalKaryawan: async (req, res) => {
        try {
            const promisePool = pool.promise();
            // Check if the user exists in the database
            let [query, field] = await promisePool.query(
                'SELECT * FROM tb_karyawan',
                [req.session.user.id]);

            if (query[0] == undefined) {
                return res.status(400).json({ message: "Data tidak ditemukan" });

            }

            return res.status(200).json({ data: query });


        } catch (err) {
            console.error('Error uploading file:', err.response);
            res.status(500).send(`Error uploading file: ${err.message}`);
        }
    },



}

