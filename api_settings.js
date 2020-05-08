const express = require("express");
const router = express.Router();
const constants = require("./constant");
const path = require("path");
const fs = require("fs-extra");

router.post("/search", async (req, res) => {
    try {
        let directory = './settings'

        await fs.readdir(directory, (err, files) => {
            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let records = []
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: directory+'/' +req.body.time.split(':')[0] + "." + req.body.time.split(':')[1] + '_' + req.body.exp + '_' + req.body.gear,
            header: [
            ]
        });

        csvWriter.writeRecords(records)       // returns a promise
        res.json({ result: constants.kResultOk })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

router.get("/data", async (req, res) => {
    try {
        const directoryPath = path.join('./settings');

        fs.readdir(directoryPath, function (err, files) {
            console.log(files)
            let time = files[0].split('_')[0] 
            let splTime = time.split('.')[0] + ":" + time.split('.')[1]
            res.json({ time: splTime, exp: files[0].split('_')[1], gear: files[0].split('_')[2] })

           
        });

    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

module.exports = router