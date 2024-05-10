
require('dotenv').config();
var express = require('express');
var router = express.Router();
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const ExcelJS = require('exceljs');

module.exports = {
    getAllKaryawan: async function (req, res) {
        try {
            const promisePool = pool.promise();

            let getMember = await promisePool.query(`SELECT tk.id, tk.npk, tk.nama, td.nama_divisi, u.is_admin FROM tb_karyawan tk
            INNER JOIN tb_divisi td ON  td.id = tk.divisi_id
            INNER JOIN user u ON u.npk_karyawan = tk.npk`);



            const response = {
                status: 200,
                message: 'Success get member',
                data: getMember[0]
            };

            res.status(200).json(response)
        } catch (error) {
            // Handling the error
            console.error(error);

            // Creating the error response JSON
            const errorResponse = {
                message: 'Error occurred',
                error: error.message
            };

            // Sending the error response with a status code of 500
            res.status(500).json(errorResponse);

        }

    },
    getRole: async function (req, res) {
        try {
            const promisePool = pool.promise();

            const getListResponse = await promisePool.query(`SELECT * FROM tb_divisi ORDER BY nama_divisi ASC;`);


            const response = {
                status: 200,
                message: 'Success get province',
                data: getListResponse[0]
            };

            res.status(200).json(response)
        } catch (error) {
            // Handling the error
            console.error(error);

            // Creating the error response JSON
            const errorResponse = {
                message: 'Error occurred',
                error: error.message
            };

            // Sending the error response with a status code of 500
            res.status(500).json(errorResponse);

        }

    },
    inputKaryawan: async function (req, res) {
        try {
            var body = req.body;
            console.log(body)
            const promisePool = pool.promise();

            const queryPerson = await promisePool.query(
                `INSERT INTO tb_karyawan ( npk, nama, divisi_id) VALUES (?)`,
                [
                    [
                        body.npk,
                        body.nama,
                        body.addDivisi,
                    ]
                ]
            );

            // Get the ID of the inserted row
            const insertedId = queryPerson[0].insertId;
            console.log("insertedId", insertedId)


            // console.log(queryPerson[0].insertId)

            var saltRounds = 10;
            const hashedPassword = await bcrypt.hash(body.password, saltRounds);

            const [insertUsers] = await promisePool.query(`INSERT INTO user (id, npk_karyawan, password) VALUES (?)`, [
                [insertedId, body.npk, hashedPassword]
            ])

            console.log({
                "insertUsers": insertUsers
            })

            const response = {
                status: 201,
                message: 'Success Daftar KTA',
            };

            res.status(201).json(response)

        } catch (error) {
            // Handling the error
            console.error(error);

            // Creating the error response JSON
            const errorResponse = {
                message: 'Error occurred',
                error: error.message
            };

            // Sending the error response with a status code of 500
            res.status(500).json(errorResponse);
        }
    },
    editKaryawan: async function (req, res) {
        try {

            const alertMessage = req.flash("alertMessage");
            const alertStatus = req.flash("alertStatus");

            const alert = {
                message: alertMessage,
                status: alertStatus,
            };
            const body = req.body


            var user = req.session.user
            console.log("====asdadsa", body)

            const promisePool = pool.promise();

            const [updateKaryawan] = await promisePool.query(`UPDATE tb_karyawan
                SET npk = ?, nama = ?, divisi_id = ? WHERE id = ?`, [body.editNpk, body.editName, body.editDivisi, body.user_id])

            var saltRounds = 10;
            const hashedPassword = await bcrypt.hash(body.editPassword, saltRounds);

            const [updateUsers] = await promisePool.query(`UPDATE user
                SET npk_karyawan = ?, password = ?, is_admin = ? WHERE id = ?`, [body.editNpk, hashedPassword, body.is_admin, body.user_id])

            const responsess = {
                status: 200,
                message: 'Success Edit Karyawan',
            };

            res.status(200).json(responsess)



        } catch (error) {
            console.log(error)
        }
    },
    deleteKaryawan: async function (req, res) {
        try {
            const promisePool = pool.promise();

            const hapusMember = await promisePool.query(`DELETE FROM user
            WHERE id =?`, [req.body.id]);

            const hapusKaryawan = await promisePool.query(`DELETE FROM tb_karyawan
            WHERE id =?`, [req.body.id]);

            console.log(hapusMember[0])


            const response = {
                status: 200,
                message: 'Success hapus karyawan',
            };

            res.status(200).json(response)
        } catch (error) {
            // Handling the error
            console.error(error);

            // Creating the error response JSON
            const errorResponse = {
                message: 'Error occurred',
                error: error.message
            };

            // Sending the error response with a status code of 500
            res.status(500).json(errorResponse);

        }

    },




}

