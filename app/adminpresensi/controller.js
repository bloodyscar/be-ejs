
require('dotenv').config();
var express = require('express');
var router = express.Router();
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const ExcelJS = require('exceljs');
const moment = require('moment-timezone');


function parseTimeStringToDateTime(timeString) {
    const date = new Date(timeString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function dateTimeUtc(datetimeString) {
    // Parse the datetime string to create a Date object
    const datetime = new Date(datetimeString);

    // Convert the datetime to UTC
    const utcDatetime = new Date(datetime.toISOString());

    return utcDatetime;
}

module.exports = {
    getAllPresensi: async function (req, res) {
        try {
            const promisePool = pool.promise();

            let getMember = await promisePool.query(`SELECT tp.id, tk.nama, tk.npk, td.nama_divisi, tp.jam_absen_masuk, tp.jam_absen_keluar, tp.tanggal FROM tb_presensi tp INNER JOIN tb_karyawan tk ON tk.id = tp.karyawan_id INNER JOIN tb_divisi td ON td.id = tk.divisi_id;`);


            console.log(getMember[0])

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
    cetakExcelByFilter: async function (req, res) {
        try {
            const promisePool = pool.promise();

            console.log(req.body.start)
            console.log(req.body.end)

            let getMember = await promisePool.query(`SELECT tk.nama, tk.npk, td.nama_divisi, tp.jam_absen_masuk, tp.jam_absen_keluar, tp.tanggal FROM tb_presensi tp INNER JOIN tb_karyawan tk ON tk.id = tp.karyawan_id INNER JOIN tb_divisi td ON td.id = tk.divisi_id
            WHERE tanggal BETWEEN ? AND ?`, [req.body.start, req.body.end]);



            console.log(getMember[0])

            // Create a new Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Presensi'); // Name of the worksheet

            // Add header row
            worksheet.addRow(['Nama', 'NPK', 'Divisi', 'Jam Masuk', 'Jam Pulang', 'Tanggal']);

            // Add data rows
            getMember[0].forEach(member => {
                worksheet.addRow([
                    member.nama,
                    member.npk,
                    member.nama_divisi,
                    parseTimeStringToDateTime(member.jam_absen_masuk),
                    parseTimeStringToDateTime(member.jam_absen_keluar),
                    member.tanggal
                ]);
            });

            // Generate Excel file buffer
            const excelBuffer = await workbook.xlsx.writeBuffer();

            // Set response headers for Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Presensi.xlsx');

            // Send the Excel file as response
            res.send(excelBuffer);
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
    editPresensi: async function (req, res) {
        try {

            const alertMessage = req.flash("alertMessage");
            const alertStatus = req.flash("alertStatus");

            const alert = {
                message: alertMessage,
                status: alertStatus,
            };
            const body = req.body

            console.log()

            var user = req.session.user
            console.log("====asdadsa", body)

            console.log("dateTimeUtc(body.editPresensiMasuk)", dateTimeUtc(body.editPresensiMasuk))

            const promisePool = pool.promise();

            const [updateKaryawan] = await promisePool.query(`UPDATE tb_presensi
                SET tanggal = ?, jam_absen_masuk = ?, jam_absen_keluar = ? WHERE id = ?`, [body.editTanggal, dateTimeUtc(body.editPresensiMasuk), body.editPresensiPulang, body.user_id])

            const responsess = {
                status: 200,
                message: 'Success Edit Karyawan',
            };

            res.status(200).json(responsess)



        } catch (error) {
            console.log(error)
        }
    },



}

