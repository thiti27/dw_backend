const neatCsv = require('neat-csv');
const express = require("express");
const router = express.Router();
var yahooFinance = require('yahoo-finance');
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const formular = require("./models/formular");
const buy = require("./models/buy");
const sell = require("./models/sell");
var format = require('date-format');
const SMA = require('technicalindicators').SMA;
const EMA = require('technicalindicators').EMA
var MACD = require('technicalindicators').MACD;
var RSI = require('technicalindicators').RSI;
const csvToJson = require("csv-file-to-json");
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
router.get("/buy", async (req, res) => {
    try {

        let directory = './compare'
        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = ['AAV.BK', 'ADVANC.BK', 'AEONTS.BK',
            'AMATA.BK', 'ANAN.BK', 'AOT.BK', 'AP.BK', 'AWC.BK',
            'BANPU.BK', 'BBL.BK', 'BCH.BK', 'BCP.BK', 'BCPG.BK',
            'BDMS.BK', 'BEC.BK', 'BEM.BK', 'BGRIM.BK',
            'BH.BK', 'BLAND.BK', 'BJC.BK', 'BPP.BK', 'BTS.BK',
            'CBG.BK', 'CENTEL.BK', 'CHG.BK', 'CK.BK', 'CKP.BK',
            'COM7.BK', 'CPALL.BK', 'CPF.BK', 'CPN.BK', 'CRC.BK',
            'DTAC.BK', 'EA.BK', 'EGCO.BK', 'EPG.BK', 'ERW.BK',
            'ESSO.BK', 'GFPT.BK', 'GLOBAL.BK', 'GPSC.BK', 'GULF.BK',
            'GUNKUL.BK', 'HANA.BK', 'HMPRO.BK', 'INTUCH.BK',
            'IRPC.BK', 'IVL.BK', 'JAS.BK', 'JMT.BK',
            'KBANK.BK', 'KCE.BK', 'KKP.BK', 'KTB.BK', 'KTC.BK',
            'LH.BK', 'MAJOR.BK', 'MBK.BK', 'MEGA.BK', 'MINT.BK',
            'MTC.BK', 'ORI.BK', 'OSP.BK',
            'PLANB.BK', 'PRM.BK', 'PSH.BK', 'PSL.BK', 'PTG.BK',
            'PTT.BK', 'PTTEP.BK', 'PTTGC.BK', 'QH.BK', 'RATCH.BK',
            'RS.BK', 'SAWAD.BK', 'SCB.BK', 'SCC.BK', 'SGP.BK',
            'SPALI.BK', 'SPRC.BK', 'STA.BK', 'STEC.BK', 'STPI.BK',
            'SUPER.BK', 'TASCO.BK', 'TCAP.BK', 'THAI.BK', 'THANI.BK',
            'TISCO.BK', 'TKN.BK', 'TMB.BK', 'TOA.BK',
            'TOP.BK', 'TPIPP.BK', 'TRUE.BK', 'TTW.BK', 'TU.BK',
            'WHA.BK']


        let result = await formular.findOne({
            where: {

                use: '1'
            }

        })
        let buyFormular = await buy.findAll({ where: { for_id: result.id } })
        let indy1 = [];
        let val1 = [];
        let indy2 = [];
        let val2 = [];

        for (let i = 0; i < buyFormular.length; i++) {
            indy1.push(buyFormular[i].indy1)
            val1.push(buyFormular[i].val1)
            indy2.push(buyFormular[i].indy2)
            val2.push(buyFormular[i].val2)
        }


        let dataClose = [];
        let dataDate = [];
        let dataCheck = [];

        for (let index = 0; index < stock_name.length; index++) {
            await snooze(100);
            const data = csvToJson({ filePath: "./data/_" + stock_name[index] + ".csv" });
            for (let i = 0; i < data.length; i++) {
                dataClose[i] = parseInt(data[i].close)
                dataDate[i] = (data[i].date)

            }

            dataClose.splice(0, 1);
            dataDate.splice(0, 1);
            for (let i = 0; i < buyFormular.length; i++) {

                if (indy1[i] == "SMA") {
                    dataCheck = [];
                    var a = SMA.calculate({ period: val1[i], values: dataClose })
                    var b = SMA.calculate({ period: val2[i], values: dataClose })
                    var c = []
                    var d = []
                    var condition1 = []
                    var condition2 = []
                    for (let k = 0; k < val1[i] - 1; k++) {
                        c.push(0)
                    }
                    for (let k = 0; k < val2[i] - 1; k++) {
                        d.push(0)
                    }
                    condition1 = c.concat(a)
                    condition2 = d.concat(b)

                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {
                        if (condition1[j] < condition2[j] && condition2[j] != 0) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }

                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2[p],
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)

                }
                if (indy1[i] == "EMA") {
                    dataCheck = [];
                    var a = EMA.calculate({ period: val1[i], values: dataClose })
                    var b = EMA.calculate({ period: val2[i], values: dataClose })
                    var c = []
                    var d = []

                    var condition1 = []
                    var condition2 = []
                    for (let k = 0; k < val1[i] - 1; k++) {
                        c.push(0)
                    }
                    for (let k = 0; k < val2[i] - 1; k++) {
                        d.push(0)
                    }
                    condition1 = c.concat(a)
                    condition2 = d.concat(b)

                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {
                        if (condition1[j] < condition2[j] && condition2[j] != 0) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }
                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2[p],
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)

                }
                if (indy1[i] == "MACD") {

                    var spl = val1[i].split(",")
                    var macdInput = {
                        values: dataClose,
                        fastPeriod: spl[0],
                        slowPeriod: spl[1],
                        signalPeriod: spl[2],
                        SimpleMAOscillator: false,
                        SimpleMASignal: false
                    }
                    var a = MACD.calculate(macdInput);
                    var b = val2[i]
                    var c = []
                    var d = []
                    var condition1 = []
                    var condition2 = []


                    for (let h = 0; h < a.length; h++) {
                        d.push(a[i].MACD)

                    }
                    for (let k = 0; k < (spl[1] - 1); k++) {
                        c.push(0)
                    }

                    condition1 = c.concat(d)
                    condition2 = val2[i]
                    dataMACD = [];
                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {
                        if (condition1[j] > condition2) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }
                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2,
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)


                }
                if (indy1[i] == "RSI") {
                    dataCheck = [];
                    var inputRSI = {
                        values: dataClose,
                        period: val1[i]
                    };

                    var a = RSI.calculate(inputRSI)
                    var b = val2[i]
                    var c = []
                    var d = []
                    var condition1 = []
                    var condition2 = []
                    for (let k = 0; k < val1[i]; k++) {
                        c.push(0)
                    }

                    condition1 = c.concat(a)
                    condition2 = val2[i]

                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {

                        if (condition1[j] < condition2) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }
                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2,
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)
                }
            }


            fs.readdir(directory, (err, files) => {
                if (files.length == (98 * buyFormular.length)) {
                    console.log("Cal complete")
                    res.json("Calculate complete")
                }

            });

        }


    } catch (error) {

    }

})

router.get("/findbuy1", async (req, res) => {
    try {


        let directory = './buySignal'

        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = ['AAV.BK', 'ADVANC.BK', 'AEONTS.BK',
            'AMATA.BK', 'ANAN.BK', 'AOT.BK', 'AP.BK', 'AWC.BK',
            'BANPU.BK', 'BBL.BK', 'BCH.BK', 'BCP.BK', 'BCPG.BK',
            'BDMS.BK', 'BEC.BK', 'BEM.BK', 'BGRIM.BK',
            'BH.BK', 'BLAND.BK', 'BJC.BK', 'BPP.BK', 'BTS.BK',
            'CBG.BK', 'CENTEL.BK', 'CHG.BK', 'CK.BK', 'CKP.BK',
            'COM7.BK', 'CPALL.BK', 'CPF.BK', 'CPN.BK', 'CRC.BK',
            'DTAC.BK', 'EA.BK', 'EGCO.BK', 'EPG.BK', 'ERW.BK',
            'ESSO.BK', 'GFPT.BK', 'GLOBAL.BK', 'GPSC.BK', 'GULF.BK',
            'GUNKUL.BK', 'HANA.BK', 'HMPRO.BK', 'INTUCH.BK',
            'IRPC.BK', 'IVL.BK', 'JAS.BK', 'JMT.BK',
            'KBANK.BK', 'KCE.BK', 'KKP.BK', 'KTB.BK', 'KTC.BK',
            'LH.BK', 'MAJOR.BK', 'MBK.BK', 'MEGA.BK', 'MINT.BK',
            'MTC.BK', 'ORI.BK', 'OSP.BK',
            'PLANB.BK', 'PRM.BK', 'PSH.BK', 'PSL.BK', 'PTG.BK',
            'PTT.BK', 'PTTEP.BK', 'PTTGC.BK', 'QH.BK', 'RATCH.BK',
            'RS.BK', 'SAWAD.BK', 'SCB.BK', 'SCC.BK', 'SGP.BK',
            'SPALI.BK', 'SPRC.BK', 'STA.BK', 'STEC.BK', 'STPI.BK',
            'SUPER.BK', 'TASCO.BK', 'TCAP.BK', 'THAI.BK', 'THANI.BK',
            'TISCO.BK', 'TKN.BK', 'TMB.BK', 'TOA.BK',
            'TOP.BK', 'TPIPP.BK', 'TRUE.BK', 'TTW.BK', 'TU.BK',
            'WHA.BK']


        let result = await formular.findOne({ where: { use: '1' } })
        let buyFormular = await buy.findAll({ where: { for_id: result.id } })
        let num = buyFormular.length
        for (let index = 0; index < stock_name.length; index++) {
            await snooze(100);
            const csvToJson = require("csv-file-to-json");
            const data = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
            data.splice(0, 1);
            let sig = [];
            const records = [

            ];
            if (num == 1) {

                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                data0.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }

                const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                const csvWriter = createCsvWriter({
                    path: './buySignal/_' + stock_name[index] + '.csv',
                    header: [
                        { id: 'date', title: 'date' },
                        { id: 'check', title: 'check' },

                    ]
                });

                for (let p = 0; p < data.length; p++) {
                    records.push({
                        date: data[p].date,
                        check: sig[p],
                    })
                }
                csvWriter.writeRecords(records)
            }
            if (num == 2) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 3) {

                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 4) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1" && data3[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 5) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 6) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1" && data5[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 7) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);

                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1" && data6[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 8) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare/_' + stock_name[index] + '7.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 9) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare/_' + stock_name[index] + '7.csv' });
                const data8 = csvToJson({ filePath: './compare/_' + stock_name[index] + '8.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                data8.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1" && data8[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 10) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare/_' + stock_name[index] + '7.csv' });
                const data8 = csvToJson({ filePath: './compare/_' + stock_name[index] + '8.csv' });
                const data9 = csvToJson({ filePath: './compare/_' + stock_name[index] + '9.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                data8.splice(0, 1);
                data9.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1" && data8[i].check == "1"
                        && data9[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }

            fs.readdir(directory, (err, files) => {
                if (files.length == 98) {
                    console.log("Complete")
                    res.json("Calculate complete")
                }

            });


        }
    } catch (error) {
        res.json(error)
    }
})

router.get("/findbuy", async (req, res) => {
    try {


        let directory = './buySignal'

        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = ['AAV.BK', 'ADVANC.BK', 'AEONTS.BK',
            'AMATA.BK', 'ANAN.BK', 'AOT.BK', 'AP.BK', 'AWC.BK',
            'BANPU.BK', 'BBL.BK', 'BCH.BK', 'BCP.BK', 'BCPG.BK',
            'BDMS.BK', 'BEC.BK', 'BEM.BK', 'BGRIM.BK',
            'BH.BK', 'BLAND.BK', 'BJC.BK', 'BPP.BK', 'BTS.BK',
            'CBG.BK', 'CENTEL.BK', 'CHG.BK', 'CK.BK', 'CKP.BK',
            'COM7.BK', 'CPALL.BK', 'CPF.BK', 'CPN.BK', 'CRC.BK',
            'DTAC.BK', 'EA.BK', 'EGCO.BK', 'EPG.BK', 'ERW.BK',
            'ESSO.BK', 'GFPT.BK', 'GLOBAL.BK', 'GPSC.BK', 'GULF.BK',
            'GUNKUL.BK', 'HANA.BK', 'HMPRO.BK', 'INTUCH.BK',
            'IRPC.BK', 'IVL.BK', 'JAS.BK', 'JMT.BK',
            'KBANK.BK', 'KCE.BK', 'KKP.BK', 'KTB.BK', 'KTC.BK',
            'LH.BK', 'MAJOR.BK', 'MBK.BK', 'MEGA.BK', 'MINT.BK',
            'MTC.BK', 'ORI.BK', 'OSP.BK',
            'PLANB.BK', 'PRM.BK', 'PSH.BK', 'PSL.BK', 'PTG.BK',
            'PTT.BK', 'PTTEP.BK', 'PTTGC.BK', 'QH.BK', 'RATCH.BK',
            'RS.BK', 'SAWAD.BK', 'SCB.BK', 'SCC.BK', 'SGP.BK',
            'SPALI.BK', 'SPRC.BK', 'STA.BK', 'STEC.BK', 'STPI.BK',
            'SUPER.BK', 'TASCO.BK', 'TCAP.BK', 'THAI.BK', 'THANI.BK',
            'TISCO.BK', 'TKN.BK', 'TMB.BK', 'TOA.BK',
            'TOP.BK', 'TPIPP.BK', 'TRUE.BK', 'TTW.BK', 'TU.BK',
            'WHA.BK']


        let result = await formular.findOne({ where: { use: '1' } })
        let sellFormular = await buy.findAll({ where: { for_id: result.id } })
        let num = sellFormular.length
        for (let index = 0; index < stock_name.length; index++) {
            await snooze(100);
            const csvToJson = require("csv-file-to-json");
            const data = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
            data.splice(0, 1);
            let sig = [];
            const records = [

            ];
            if (num == 1) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                data0.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 2) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 3) {

                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 4) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1" && data3[i].check == "1") {
                        sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 5) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1") {
                            sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 6) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1" && data5[i].check == "1") {
                            sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 7) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);

                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1" && data6[i].check == "1") {
                            sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 8) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare/_' + stock_name[index] + '7.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1") {
                            sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 9) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare/_' + stock_name[index] + '7.csv' });
                const data8 = csvToJson({ filePath: './compare/_' + stock_name[index] + '8.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                data8.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1" && data8[i].check == "1") {
                            sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 10) {
                const data0 = csvToJson({ filePath: './compare/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare/_' + stock_name[index] + '7.csv' });
                const data8 = csvToJson({ filePath: './compare/_' + stock_name[index] + '8.csv' });
                const data9 = csvToJson({ filePath: './compare/_' + stock_name[index] + '9.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                data8.splice(0, 1);
                data9.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1" && data8[i].check == "1"
                        && data9[i].check == "1") {
                            sig.push('BUY')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }

            const createCsvWriter = require('csv-writer').createObjectCsvWriter;
            const csvWriter = createCsvWriter({
                path: './buySignal/_' + stock_name[index] + '.csv',
                header: [
                    { id: 'date', title: 'date' },
                    { id: 'check', title: 'check' },

                ]
            });

            for (let p = 0; p < data.length; p++) {
                records.push({
                    date: data[p].date,
                    check: sig[p],
                })
            }
            csvWriter.writeRecords(records)


            fs.readdir(directory, (err, files) => {
                if (files.length == 98) {
                    console.log("Signal BUY Complete")
                    res.json("Signal BUY Complete")

                }

            });


        }
    } catch (error) {

    }
})

router.get("/sell", async (req, res) => {
    try {

        let directory = './compare_sell'
        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = ['AAV.BK', 'ADVANC.BK', 'AEONTS.BK',
            'AMATA.BK', 'ANAN.BK', 'AOT.BK', 'AP.BK', 'AWC.BK',
            'BANPU.BK', 'BBL.BK', 'BCH.BK', 'BCP.BK', 'BCPG.BK',
            'BDMS.BK', 'BEC.BK', 'BEM.BK', 'BGRIM.BK',
            'BH.BK', 'BLAND.BK', 'BJC.BK', 'BPP.BK', 'BTS.BK',
            'CBG.BK', 'CENTEL.BK', 'CHG.BK', 'CK.BK', 'CKP.BK',
            'COM7.BK', 'CPALL.BK', 'CPF.BK', 'CPN.BK', 'CRC.BK',
            'DTAC.BK', 'EA.BK', 'EGCO.BK', 'EPG.BK', 'ERW.BK',
            'ESSO.BK', 'GFPT.BK', 'GLOBAL.BK', 'GPSC.BK', 'GULF.BK',
            'GUNKUL.BK', 'HANA.BK', 'HMPRO.BK', 'INTUCH.BK',
            'IRPC.BK', 'IVL.BK', 'JAS.BK', 'JMT.BK',
            'KBANK.BK', 'KCE.BK', 'KKP.BK', 'KTB.BK', 'KTC.BK',
            'LH.BK', 'MAJOR.BK', 'MBK.BK', 'MEGA.BK', 'MINT.BK',
            'MTC.BK', 'ORI.BK', 'OSP.BK',
            'PLANB.BK', 'PRM.BK', 'PSH.BK', 'PSL.BK', 'PTG.BK',
            'PTT.BK', 'PTTEP.BK', 'PTTGC.BK', 'QH.BK', 'RATCH.BK',
            'RS.BK', 'SAWAD.BK', 'SCB.BK', 'SCC.BK', 'SGP.BK',
            'SPALI.BK', 'SPRC.BK', 'STA.BK', 'STEC.BK', 'STPI.BK',
            'SUPER.BK', 'TASCO.BK', 'TCAP.BK', 'THAI.BK', 'THANI.BK',
            'TISCO.BK', 'TKN.BK', 'TMB.BK', 'TOA.BK',
            'TOP.BK', 'TPIPP.BK', 'TRUE.BK', 'TTW.BK', 'TU.BK',
            'WHA.BK']

        let result = await formular.findOne({
            where: {

                use: '1'
            }

        })
        let sellFormular = await sell.findAll({ where: { for_id: result.id } })
        let indy1 = [];
        let val1 = [];
        let indy2 = [];
        let val2 = [];

        for (let i = 0; i < sellFormular.length; i++) {
            indy1.push(sellFormular[i].indy1)
            val1.push(sellFormular[i].val1)
            indy2.push(sellFormular[i].indy2)
            val2.push(sellFormular[i].val2)
        }


        let dataClose = [];
        let dataDate = [];
        let dataCheck = [];

        for (let index = 0; index < stock_name.length; index++) {
            await snooze(100);
            const data = csvToJson({ filePath: "./data/_" + stock_name[index] + ".csv" });
            for (let i = 0; i < data.length; i++) {
                dataClose[i] = parseInt(data[i].close)
                dataDate[i] = (data[i].date)

            }

            dataClose.splice(0, 1);
            dataDate.splice(0, 1);
            for (let i = 0; i < sellFormular.length; i++) {

                if (indy1[i] == "SMA") {
                    dataCheck = [];
                    var a = SMA.calculate({ period: val1[i], values: dataClose })
                    var b = SMA.calculate({ period: val2[i], values: dataClose })
                    var c = []
                    var d = []
                    var condition1 = []
                    var condition2 = []
                    for (let k = 0; k < val1[i] - 1; k++) {
                        c.push(0)
                    }
                    for (let k = 0; k < val2[i] - 1; k++) {
                        d.push(0)
                    }
                    condition1 = c.concat(a)
                    condition2 = d.concat(b)

                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {
                        if (condition1[j] > condition2[j] && condition2[j] != 0) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }

                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare_sell/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2[p],
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)

                }
                if (indy1[i] == "EMA") {
                    dataCheck = [];
                    var a = EMA.calculate({ period: val1[i], values: dataClose })
                    var b = EMA.calculate({ period: val2[i], values: dataClose })
                    var c = []
                    var d = []

                    var condition1 = []
                    var condition2 = []
                    for (let k = 0; k < val1[i] - 1; k++) {
                        c.push(0)
                    }
                    for (let k = 0; k < val2[i] - 1; k++) {
                        d.push(0)
                    }
                    condition1 = c.concat(a)
                    condition2 = d.concat(b)

                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {
                        if (condition1[j] > condition2[j] && condition2[j] != 0) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }
                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare_sell/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2[p],
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)

                }
                if (indy1[i] == "MACD") {

                    var spl = val1[i].split(",")
                    var macdInput = {
                        values: dataClose,
                        fastPeriod: spl[0],
                        slowPeriod: spl[1],
                        signalPeriod: spl[2],
                        SimpleMAOscillator: false,
                        SimpleMASignal: false
                    }
                    var a = MACD.calculate(macdInput);
                    var b = val2[i]
                    var c = []
                    var d = []
                    var condition1 = []
                    var condition2 = []


                    for (let h = 0; h < a.length; h++) {
                        d.push(a[i].MACD)

                    }
                    for (let k = 0; k < (spl[1] - 1); k++) {
                        c.push(0)
                    }

                    condition1 = c.concat(d)
                    condition2 = val2[i]
                    dataMACD = [];
                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {
                        if (condition1[j] > condition2) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }
                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare_sell/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2,
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)


                }
                if (indy1[i] == "RSI") {
                    dataCheck = [];
                    var inputRSI = {
                        values: dataClose,
                        period: val1[i]
                    };

                    var a = RSI.calculate(inputRSI)
                    var b = val2[i]
                    var c = []
                    var d = []
                    var condition1 = []
                    var condition2 = []
                    for (let k = 0; k < val1[i]; k++) {
                        c.push(0)
                    }

                    condition1 = c.concat(a)
                    condition2 = val2[i]

                    const records = [

                    ];
                    for (let j = 0; j < dataClose.length; j++) {

                        if (condition1[j] > condition2 && condition1[j] != 0) {
                            dataCheck[j] = '1'
                        }
                        else {
                            dataCheck[j] = '0'
                        }
                    }
                    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
                    const csvWriter = createCsvWriter({
                        path: './compare_sell/_' + stock_name[index] + i + '.csv',
                        header: [
                            { id: 'date', title: 'date' },
                            { id: 'indy1', title: 'indy1' },
                            { id: 'indy2', title: 'indy2' },
                            { id: 'check', title: 'check' },

                        ]
                    });

                    for (let p = 0; p < dataDate.length; p++) {
                        records.push({
                            date: dataDate[p],
                            indy1: condition1[p],
                            indy2: condition2,
                            check: dataCheck[p],
                        })
                    }
                    csvWriter.writeRecords(records)
                }
            }


            fs.readdir(directory, (err, files) => {
                if (files.length == (98 * sellFormular.length)) {
                    console.log("Calculate complete")
                    res.json("Calculate complete")
                }

            });

        }


    } catch (error) {

    }

})

router.get("/findsell", async (req, res) => {
    try {


        let directory = './sellSignal'

        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = ['AAV.BK', 'ADVANC.BK', 'AEONTS.BK',
            'AMATA.BK', 'ANAN.BK', 'AOT.BK', 'AP.BK', 'AWC.BK',
            'BANPU.BK', 'BBL.BK', 'BCH.BK', 'BCP.BK', 'BCPG.BK',
            'BDMS.BK', 'BEC.BK', 'BEM.BK', 'BGRIM.BK',
            'BH.BK', 'BLAND.BK', 'BJC.BK', 'BPP.BK', 'BTS.BK',
            'CBG.BK', 'CENTEL.BK', 'CHG.BK', 'CK.BK', 'CKP.BK',
            'COM7.BK', 'CPALL.BK', 'CPF.BK', 'CPN.BK', 'CRC.BK',
            'DTAC.BK', 'EA.BK', 'EGCO.BK', 'EPG.BK', 'ERW.BK',
            'ESSO.BK', 'GFPT.BK', 'GLOBAL.BK', 'GPSC.BK', 'GULF.BK',
            'GUNKUL.BK', 'HANA.BK', 'HMPRO.BK', 'INTUCH.BK',
            'IRPC.BK', 'IVL.BK', 'JAS.BK', 'JMT.BK',
            'KBANK.BK', 'KCE.BK', 'KKP.BK', 'KTB.BK', 'KTC.BK',
            'LH.BK', 'MAJOR.BK', 'MBK.BK', 'MEGA.BK', 'MINT.BK',
            'MTC.BK', 'ORI.BK', 'OSP.BK',
            'PLANB.BK', 'PRM.BK', 'PSH.BK', 'PSL.BK', 'PTG.BK',
            'PTT.BK', 'PTTEP.BK', 'PTTGC.BK', 'QH.BK', 'RATCH.BK',
            'RS.BK', 'SAWAD.BK', 'SCB.BK', 'SCC.BK', 'SGP.BK',
            'SPALI.BK', 'SPRC.BK', 'STA.BK', 'STEC.BK', 'STPI.BK',
            'SUPER.BK', 'TASCO.BK', 'TCAP.BK', 'THAI.BK', 'THANI.BK',
            'TISCO.BK', 'TKN.BK', 'TMB.BK', 'TOA.BK',
            'TOP.BK', 'TPIPP.BK', 'TRUE.BK', 'TTW.BK', 'TU.BK',
            'WHA.BK']


        let result = await formular.findOne({ where: { use: '1' } })
        let sellFormular = await sell.findAll({ where: { for_id: result.id } })
        let num = sellFormular.length
        for (let index = 0; index < stock_name.length; index++) {
            await snooze(100);
            const csvToJson = require("csv-file-to-json");
            const data = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
            data.splice(0, 1);
            let sig = [];
            const records = [

            ];
            if (num == 1) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                data0.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 2) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 3) {

                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 4) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1" && data3[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 5) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '4.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 6) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '5.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1" && data5[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 7) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '6.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);

                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1" && data6[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 8) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '7.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 9) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '7.csv' });
                const data8 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '8.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                data8.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1" && data8[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }
            if (num == 10) {
                const data0 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '0.csv' });
                const data1 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '1.csv' });
                const data2 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '2.csv' });
                const data3 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '3.csv' });
                const data4 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '4.csv' });
                const data5 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '5.csv' });
                const data6 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '6.csv' });
                const data7 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '7.csv' });
                const data8 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '8.csv' });
                const data9 = csvToJson({ filePath: './compare_sell/_' + stock_name[index] + '9.csv' });
                data0.splice(0, 1);
                data1.splice(0, 1);
                data2.splice(0, 1);
                data3.splice(0, 1);
                data4.splice(0, 1);
                data5.splice(0, 1);
                data6.splice(0, 1);
                data7.splice(0, 1);
                data8.splice(0, 1);
                data9.splice(0, 1);
                for (let i = 0; i < data0.length; i++) {
                    if (data0[i].check == "1" && data1[i].check == "1" && data2[i].check == "1"
                        && data3[i].check == "1" && data4[i].check == "1"
                        && data5[i].check == "1"
                        && data6[i].check == "1" && data7[i].check == "1" && data8[i].check == "1"
                        && data9[i].check == "1") {
                        sig.push('SELL')
                    }
                    else {
                        sig.push('0')
                    }
                }
            }

            const createCsvWriter = require('csv-writer').createObjectCsvWriter;
            const csvWriter = createCsvWriter({
                path: './sellSignal/_' + stock_name[index] + '.csv',
                header: [
                    { id: 'date', title: 'date' },
                    { id: 'check', title: 'check' },

                ]
            });

            for (let p = 0; p < data.length; p++) {
                records.push({
                    date: data[p].date,
                    check: sig[p],
                })
            }
            csvWriter.writeRecords(records)


            fs.readdir(directory, (err, files) => {
                if (files.length == 98) {
                    console.log("Signal Sell Complete")
                    res.json("Signal Sell Complete")

                }

            });


        }
    } catch (error) {

    }
})


module.exports = router