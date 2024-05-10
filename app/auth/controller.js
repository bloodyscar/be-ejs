
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
    viewSignin: async function (req, res) {
        try {
            const alertMessage = req.flash("alertMessage");
            const alertStatus = req.flash("alertStatus");

            const alert = {
                message: alertMessage,
                status: alertStatus,
            };

            if (req.session.user === null || req.session.user === undefined) {
                // check jwt
                var token = req.cookies.auth;
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, token_data) {
                    if (err) {
                        console.log(err);
                        res.render('layout/auth/view', {
                            alert,
                        });
                    } else {

                        if (token_data.user.version == 1) {
                            req.session.user = {
                                auth_user_id: token_data.user.auth_user_id,
                                id: token_data.user.hr_staff_id,
                                instansi_id: token_data.user.instansi_id,
                                email: token_data.user.email,
                                status: token_data.user.status,
                                name: token_data.user.name,
                                lvl: token_data.user.lvl,
                                duration: token_data.user.duration,
                            };
                            res.redirect('/admin_presensi', {
                                alert,
                            });
                        } else {
                            console.log("false");
                            res.render('layout/auth/view', {
                                alert,
                            });
                        }
                    }
                });
            } else {
                res.redirect("/admin_presensi");
            }
        } catch (err) {
            req.flash("alertMessage", `${err.message}`);
            req.flash("alertStatus", "danger");
            res.redirect("/");
        }
    },
    signinAdmin: async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log(username)
            const promisePool = pool.promise();
            const [user, field1] = await promisePool.query(`SELECT * FROM user WHERE npk_karyawan = ?`, [username]);

            console.log(user.length)
            if (user.length > 0) {

                const checkPassword = await bcrypt.compare(password, user[0].password);

                if (checkPassword) {
                    const token = jwt.sign(
                        {
                            user: {
                                user_id: user[0].id,
                                role_id: user[0].role_id,
                                member_id: user[0].member_id,
                                username: user[0].username,
                                name: user[0].name,
                            },
                        },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: "10h" }
                    );

                    res.cookie("auth", token);

                    req.session.user = {
                        user_id: user[0].id,
                        role_id: user[0].role_id,
                        person_id: user[0].person_id,
                        username: user[0].username,
                        name: user[0].name,
                    };

                    res.redirect("/admin_presensi");


                } else {
                    console.log("password salah");
                    req.flash("alertMessage", `Kata sandi yang anda inputkan salah`);
                    req.flash("alertStatus", "danger");
                    res.redirect("/");
                }
            } else {
                req.flash("alertMessage", `Username/Password yang anda inputkan salah`);
                req.flash("alertStatus", "danger");
                res.redirect("/login");
            }
        } catch (err) {
            req.flash("alertMessage", `${err.message}`);
            req.flash("alertStatus", "danger");
            res.redirect("/login");
        }
    },
    actionSignin: async (req, res) => {
        try {
            const { npk, password } = req.body;

            if (!npk || !password) {
                return res.status(400).json({ message: 'npk and password are required' });
            }

            const promisePool = pool.promise();
            // Check if the user exists in the database
            let [user, field1] = await promisePool.query(
                'SELECT u.password, tk.id, tk.npk, tk.nama, td.nama_divisi FROM user u INNER JOIN tb_karyawan tk ON tk.npk = u.npk_karyawan INNER JOIN tb_divisi td ON td.id = tk.divisi_id WHERE npk_karyawan = ?',
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
                    res.status(200).json({ message: 'Login successful', token: token, user: req.session.user });

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

