
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

module.exports = {
    actionSignin: async (req, res) => {
        try {
            const { npk, password } = req.body;

            if (!npk || !password) {
                return res.status(400).json({ message: 'npk and password are required' });
            }

            const promisePool = pool.promise();
            // Check if the user exists in the database
            let [user, field1] = await promisePool.query(
                'SELECT tk.id, tk.npk, tk.nama, td.nama_divisi, tk.password FROM tb_karyawan tk JOIN tb_divisi td ON td.id = tk.divisi_id WHERE npk = ?',
                [npk]);

            if (user.length != 0) {
                const checkPassword = await bcrypt.compare(password, user[0].password);

                console.log("asdasd", user[0])


                if (checkPassword) {
                    const token = jwt.sign(
                        {
                            user: {
                                id: user[0].id,
                                npk: user[0].npk,
                                divisi: user[0].nama_divisi,
                                nama: user[0].nama,
                            },
                        },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: "10h" }
                    );


                    res.cookie("auth", token);

                    req.session.user = {
                        id: user[0].id,
                        npk: user[0].npk,
                        divisi: user[0].nama_divisi,
                        nama: user[0].nama,
                    };



                    // Successful login
                    res.status(200).json({ message: 'Login successful', token: token });

                } else {
                    res.status(400).json({ message: 'Salah Password' });
                }
            } else {
                res.status(400).json({ message: 'Username tidak ditemukan' });
            }





        } catch (err) {
            console.log(err.message);
        }
    },
    // actionLogout: (req, res) => {
    //     res.cookie("auth", "null");
    //     req.session.destroy();
    //     res.redirect("/");
    // },



}

