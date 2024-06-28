
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
    actionAbsenMasuk: async (req, res) => {
        try {
            const { lat, lng } = req.body;
            // Read the image file asynchronously
            fs.readFile(req.file.path, async (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }


                // Convert image data to base64
                const base64String = Buffer.from(data).toString('base64');


                // Prepare the request data
                const formData = new FormData();
                formData.append('file', base64String);
                formData.append('npk', req.body.npk);

                // Send the image file to the FastAPI server
                // let response = await axios.post('http://127.0.0.1:8000/predict-photo', formData, {
                //     headers: { 'Content-Type': 'multipart/form-data' }
                // })

                let response = await axios.post('http://103.206.246.227/predict-photo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

                console.log("res.data", response.data)

                // Check if npk "Adit Hernowo" is equal to predict "Adit Hernowo"


                // 103.206.246.227  
                if (response.data.predict == undefined || response.data.predict != req.body.npk) {
                    console.log("Tidak sama")
                    return res.status(400).json({ message: "Tidak sama" });
                } else if (response.data.contains_face == false) {
                    console.log("Tidak ada wajah")
                    return res.status(400).json(response.data);
                } else if (response.data == false) {
                    console.log("Tidak sama")
                    return res.status(400).json({ message: "Tidak sama" });
                } else {
                    const promisePool = pool.promise();
                    // Check if the user exists in the database
                    let [user, field1] = await promisePool.query(
                        'SELECT tk.id, tk.npk, tk.nama, td.nama_divisi as divisi FROM tb_karyawan tk JOIN tb_divisi td ON td.id = tk.divisi_id WHERE npk = ?',
                        [response.data.predict]);


                    // Create a timestamp representing the current date and time
                    const timestamp = moment()

                    // Format the timestamp as a string in the desired format
                    const formattedTimestamp = timestamp.format('YYYY-MM-DD HH:mm:ss');

                    console.log("formattedTimestamp", formattedTimestamp);

                    // cek tb presensi current date
                    let [query, field3] = await promisePool.query(
                        "SELECT * FROM tb_presensi WHERE karyawan_id= ? AND DATE(tanggal) = CURRENT_DATE",
                        [req.session.user.id]
                    );

                    console.log("query[0]", query[0])

                    let [user2, field2] = await promisePool.query(
                        "INSERT INTO tb_presensi (karyawan_id, jam_absen_masuk, tanggal, lat, lng) VALUES (?,?, ?, ? , ?)",
                        [req.session.user.id, formattedTimestamp, formattedTimestamp, lat, lng]
                    );
                    // Successful login
                    return res.status(201).json({ data: user[0], time: formattedTimestamp, message: "Berhasil Presensi Masuk" });
                }




            });


        } catch (err) {
            console.error('Error uploading file:', err.response);
            res.status(500).send(`Error uploading file: ${err.message}`);
        }
    },
    actionAbsenPulang: async (req, res) => {
        try {
            const { lat, lng } = req.body;

            const timestamp = moment()

            // Format the timestamp as a string in the desired format
            const formattedTimestamp = timestamp.format('YYYY-MM-DD HH:mm:ss');

            console.log("formattedTimestamp", formattedTimestamp);

            const promisePool = pool.promise();

            // cek tb presensi current date
            let [query, field3] = await promisePool.query(
                "SELECT * FROM tb_presensi WHERE karyawan_id= ? ORDER BY tanggal DESC LIMIT 1",
                [req.session.user.id]
            );

            console.log("query[0]", query[0])

            let [user2, field2] = await promisePool.query(
                "UPDATE tb_presensi SET karyawan_id = ?, jam_absen_keluar =? WHERE id = ?",
                [req.session.user.id, formattedTimestamp, query[0].id]
            );
            // Successful login
            return res.status(200).json({ message: "Berhasil Presensi Pulang" });

        } catch (err) {
            console.error('Error uploading file:', err.response);
            res.status(500).send(`Error uploading file: ${err.message}`);
        }
    },
    actionCheckFace: async (req, res) => {
        try {
            let formData = new FormData();
            formData.append('npk', req.session.user.npk);
            console.log("NPK", req.session.user.npk)

            // Send the image file to the FastAPI server
            axios.post('http://103.206.246.227/check_face', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(async response => {
                    console.log("res.data", response.data)

                    if (response.data.message == "Data face belum ada") {
                        console.log("belum ada")
                        return res.status(200).json({ data: response.data });
                    } if (response.data.message == "Data face sudah ada") {
                        console.log("sudah ada")
                        return res.status(201).json({ data: response.data });
                    } else {
                        return res.status(400).json({ message: "error" });
                    }



                })
                .catch(err => {
                    console.error(err.response);
                });



        } catch (err) {
            console.error('Error uploading file:', err.response);
            res.status(500).send(`Error uploading file: ${err.message}`);
        }
    },
    checkPresensi: async (req, res) => {
        try {
            const promisePool = pool.promise();
            // Check if the user exists in the database
            // let [query, field] = await promisePool.query(
            //     'SELECT karyawan_id, jam_absen_masuk, jam_absen_keluar, tanggal, lat, lng FROM tb_presensi WHERE karyawan_id = ? AND DATE(tanggal) = CURRENT_DATE',
            //     [req.session.user.id]);
            let [query, field] = await promisePool.query(
                'SELECT karyawan_id, jam_absen_masuk, jam_absen_keluar, tanggal, lat, lng FROM tb_presensi tp WHERE karyawan_id = ? ORDER BY tp.jam_absen_masuk DESC',
                [req.session.user.id]);

            if (query[0] == undefined) {
                return res.status(400).json({ message: "Data tidak ditemukan" });

            }

            return res.status(200).json({ data: query[0] });




        } catch (err) {
            console.error('Error uploading file:', err.response);
            res.status(500).send(`Error uploading file: ${err.message}`);
        }
    },
    getPresensiUser: async (req, res) => {
        try {
            const promisePool = pool.promise();
            // Check if the user exists in the database
            let [query, field] = await promisePool.query(
                'SELECT jam_absen_masuk, jam_absen_keluar, tanggal FROM tb_presensi WHERE karyawan_id=?',
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

