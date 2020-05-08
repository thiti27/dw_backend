const express = require("express");
const news = require("./models/news");
const user = require("./models/user");
const compare = require("./models/signal");
const Sequelize = require("sequelize");
const constants = require("./constant");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const Op = Sequelize.Op;
const LineNotify = require("./line-notify/client");
const router = express.Router();
const csvToJson = require("csv-file-to-json");

var csv = require('fast-csv')
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
router.get("/save", async (req, res) => {
    try {

        let directory = './signal'

        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = [
            'AAV.BK',
            'ADVANC.BK', 'AEONTS.BK',
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

        let nameStock = [];
        let buytakeprofit = [];
        let buystoploss = [];
        let selltakeprofit = [];
        let sellstoploss = [];
        for (let index = 0; index < stock_name.length; index++) {
            const csvToJson = require("csv-file-to-json");
            const databuy = csvToJson({ filePath: './buySignal/_' + stock_name[index] + '.csv' });
            const datasell = csvToJson({ filePath: './sellSignal/_' + stock_name[index] + '.csv' });
            const datastock = csvToJson({ filePath: './data/_' + stock_name[index] + '.csv' });
            databuy.splice(0, 1);
            datasell.splice(0, 1);
            datastock.splice(0, 1);
            let sig = [];

            const records = [

            ];
            let ckbuy = 0;
            let cksell = 0;
            let cktp = 0;
            let cksl = 0;

            let buytp = 0;
            let buysl = 0;
            let selltp = 0;
            let sellsl = 0;
            let persell = 0;
            let perbuy = 0;

            for (let i = 0; i < datastock.length; i++) {
                if ((databuy[i].check == "BUY" && ckbuy == 2) || (databuy[i].check == "BUY" && ckbuy == 0)) {
                    console.log(databuy[i].date + ' BUY ' + datastock[i].close + " *****" + i)
                    sig[i] = 'BUY'
                    ckbuy = 1
                    cksell = 2
                    let cktp = 0;
                    let cksl = 0;
                    let tp = (datastock[i].close) * 1.03
                    let sl = (datastock[i].close) * 0.97
                    for (let j = 0; j < (datastock.length - i); j++) {
                        console.log(databuy[i + j].date + " " + datastock[i + j].close + " tp : " + tp + " sl : " + sl)
                        if (parseFloat(datastock[i + j].close) >= tp && cktp != 2) {
                            cksl = 2;
                            cktp = 2;
                            console.log("TP * ")
                            buytp = buytp + 1;
                        }
                        else if (parseFloat(datastock[i + j].close) <= sl && cksl != 2) {
                            cksl = 2;
                            cktp = 2;
                            console.log("SL")
                            buysl = buysl + 1;
                        }

                    }

                }


                if ((datasell[i].check == "SELL" && cksell == 2) || (datasell[i].check == "SELL" && cksell == 0)) {
                    console.log(databuy[i].date + ' SELL ' + datastock[i].close)
                    sig[i] = 'SELL'
                    cksell = 1
                    ckbuy = 2
                    let cktp = 0;
                    let cksl = 0;
                    let tp = (datastock[i].close) * 0.97
                    let sl = (datastock[i].close) * 1.03
                    for (let j = 0; j < (datastock.length - i); j++) {
                        console.log(datasell[i + j].date + " " + datastock[i + j].close + " tp : " + tp + " sl : " + sl)
                        if (parseFloat(datastock[i + j].close) >= tp && cktp != 2) {
                            cktp = 2;
                            cksl = 2;
                            console.log("TP")
                            selltp = selltp + 1;
                        }
                        if (parseFloat(datastock[i + j].close) <= sl && cksl != 2) {
                            cksl = 2;
                            cktp = 2;
                            sellsl = sellsl + 1;
                            console.log("SL")
                        }
                    }
                }




            }
            const createCsvWriter = require('csv-writer').createObjectCsvWriter;
            const csvWriter = createCsvWriter({
                path: './signal/_' + stock_name[index] + '.csv',
                header: [
                    { id: 'name', title: 'name' },
                    { id: 'buytp', title: 'buytp' },
                    { id: 'buysl', title: 'buysl' },
                    { id: 'perbuy', title: 'perbuy' },
                    { id: 'selltp', title: 'selltp' },
                    { id: 'sellsl', title: 'sellsl' },
                    { id: 'persell', title: 'persell' },
                    { id: 'sumt', title: 'sumt' },
                    { id: 'sumf', title: 'sumf' },
                    { id: 'sumall', title: 'sumall' },
                ]
            });
            let a = 0;
            let b = 0;

            if (buytp == 0 && buysl == 0) {
                a = 0
            }
            else {
                a = ((buytp * 100 / (buytp + buysl)))
            }
            if (selltp == 0 && sellsl == 0) {
                b = 0
            }
            else {
                b = ((selltp * 100 / (selltp + sellsl)))
            }

            let c = (buytp + selltp)
            let d = (buysl + sellsl)
            let e = (c * 100 / (c + d))
            let spl = stock_name[index].split('.BK')
            records.push({
                name: spl[0],
                buytp: buytp,
                buysl: buysl,
                perbuy: a,
                selltp: selltp,
                sellsl: sellsl,
                persell: b,
                sumt: c,
                sumf: d,
                sumall: e,
            })

            csvWriter.writeRecords(records)

            fs.readdir(directory, (err, files) => {
                if (files.length == 98) {
                    res.json("Signal complete")
                }

            });


        }

    } catch (error) {

    }
})
router.get("/show", async (req, res) => {
    try {

        let directory = './signal'

        let stock_name = [
            'AAV.BK',
            'ADVANC.BK', 'AEONTS.BK',
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
            'SUPER.BK', 'TASCO.BK', 'TCAP', 'THAI.BK', 'THANI.BK',
            'TISCO.BK', 'TKN.BK', 'TMB.BK', 'TOA.BK',
            'TOP.BK', 'TPIPP.BK', 'TRUE.BK', 'TTW.BK', 'TU.BK',
            'WHA.BK']

        let nameStock = [];
        let a = [];
        let b = [];
        let c = [];
        let d = [];
        let e = [];
        let f = [];
        let g = [];
        let h = [];
        let k = [];
        for (let index = 0; index < stock_name.length; index++) {
            const csvToJson = require("csv-file-to-json");
            const data = csvToJson({ filePath: './signal/_' + stock_name[index] + '.csv' });
            data.splice(0, 1);

            nameStock.push(data[0].name)
            k.push(data[0].buytp)
            a.push(data[0].buysl)
            b.push(data[0].perbuy)
            c.push(data[0].selltp)
            d.push(data[0].sellsl)
            e.push(data[0].persell)
            f.push(data[0].sumt)
            g.push(data[0].sumf)
            h.push(data[0].sumall)
        }

        // let result = {
        //     name: (nameStock), k:k, a: a, b: b, c: c, d: d, c: c, d: d, e: e, f: f, g: g, h: h
        // }
        res.json({ name: (nameStock), k: k, a: a, b: b, c: c, d: d, c: c, d: d, e: e, f: f, g: g, h: h });
        // res.json(nameStock)
    } catch (error) {

    }
})

router.get("/backtest", async (req, res) => {
    try {

        let directory = './backtest'

        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        let stock_name = [
            'AAV.BK',
            'ADVANC.BK', 'AEONTS.BK',
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

        let nameStock = [];
        let buytakeprofit = [];
        let buystoploss = [];
        let selltakeprofit = [];
        let sellstoploss = [];
        for (let index = 0; index < stock_name.length; index++) {
            await snooze(200);
            const csvToJson = require("csv-file-to-json");
            const databuy = csvToJson({ filePath: './buySignal/_' + stock_name[index] + '.csv' });
            const datasell = csvToJson({ filePath: './sellSignal/_' + stock_name[index] + '.csv' });
            const datastock = csvToJson({ filePath: './data/_' + stock_name[index] + '.csv' });
            databuy.splice(0, 1);
            datasell.splice(0, 1);
            datastock.splice(0, 1);
            let sig = [];


            const records = [

            ];
            let ckbuy = 0;
            let cksell = 0;
            let cktp = 0;
            let cksl = 0;

            let buytp = 0;
            let buysl = 0;
            let selltp = 0;
            let sellsl = 0;
            let persell = 0;
            let perbuy = 0;

            for (let i = 0; i < datastock.length; i++) {
                if ((databuy[i].check == "BUY" && ckbuy == 2) || (databuy[i].check == "BUY" && ckbuy == 0)) {
                    console.log(databuy[i].date + ' BUY ' + datastock[i].close + " *****" + stock_name[index])
                    sig.push('BUY')
                    ckbuy = 1
                    cksell = 2

                }

                else if ((datasell[i].check == "SELL" && cksell == 2) || (datasell[i].check == "SELL" && cksell == 0)) {
                    console.log(databuy[i].date + ' SELL ' + datastock[i].close + " *****" + stock_name[index])
                    sig.push('SELL')
                    cksell = 1
                    ckbuy = 2

                }
                else {
                    sig.push('0')
                }



            }
            const createCsvWriter = require('csv-writer').createObjectCsvWriter;
            const csvWriter = createCsvWriter({
                path: directory + '/_' + stock_name[index] + '.csv',
                header: [
                    { id: 'date', title: 'date' },
                    { id: 'name', title: 'name' },
                    { id: 'sig', title: 'sig' },

                ]
            });



            let spl = stock_name[index].split('.BK')
            for (let p = 0; p < sig.length; p++) {
                records.push({
                    date: datastock[p].date,
                    name: spl[0],
                    sig: sig[p],

                })
            }
            csvWriter.writeRecords(records)

            fs.readdir(directory, (err, files) => {
                if (files.length == 98) {
                    res.json("Signal complete")
                }

            });



        }

    } catch (error) {

    }
})

//fecth DW data from web 
router.get("/lastrow", async (req, res) => {
    try {
        const cheerio = require('cheerio');
        const request = require('request');
        let sigBuy = [];
        let sigSell = [];
        let directory = './lastrow'

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
            'BH.BK', 'BLAND.BK', 'BJC.BK',
            'BPP.BK', 'BTS.BK',
            'CBG.BK', 'CENTEL.BK', 'CHG.BK', 'CK.BK', 'CKP.BK',
            'COM7.BK', 'CPALL.BK', 'CPF.BK', 'CPN.BK', 'CRC.BK',
            'DTAC.BK', 'EA.BK', 'EGCO.BK', 'EPG.BK', 'ERW.BK',
            'ESSO.BK', 'GFPT.BK', 'GLOBAL.BK',
            'GPSC.BK', 'GULF.BK',
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
            'WHA.BK'
        ]

        for (let index = 0; index < stock_name.length; index++) {
            compare.update(
                { buy: 0 },
                { where: { name: stock_name[index] } }
            )
            compare.update(
                { sell: 0 },
                { where: { name: stock_name[index] } }
            )

        }


        for (let index = 0; index < stock_name.length; index++) {

            const csvToJson = require("csv-file-to-json");
            const data = csvToJson({ filePath: 'backtest/_' + stock_name[index] + '.csv' });

            data.splice(0, 1);

            if (data[data.length - 1].date != null) {
                if (data[data.length - 1].sig == "BUY") {
                    let spl = stock_name[index].split('.')

                    let b = await compare.findOne({ where: { name: stock_name[index], buy: 0 } });

                    if (b == null) { // sell == 1 
                        console.log(stock_name[index])
                    }
                    if (b != null) {
                        compare.update(
                            { buy: 1 },
                            { where: { name: stock_name[index] } }
                        )
                        compare.update(
                            { sell: 0 },
                            { where: { name: stock_name[index] } }
                        )
                        sigBuy.push(spl[0])
                    }

                }
                else if (data[data.length - 1].sig == "SELL") {
                    let spl = stock_name[index].split('.')
                    let b = await compare.findOne({ where: { name: stock_name[index], sell: 0 } });
                    if (b == null) { // sell == 1 
                        console.log(stock_name[index])
                    }
                    if (b != null) {
                        compare.update(
                            { sell: 1 },
                            { where: { name: stock_name[index] } }
                        )
                        compare.update(
                            { buy: 0 },
                            { where: { name: stock_name[index] } }
                        )
                        sigSell.push(spl[0])
                    }

                }

            }

        }


        const directoryPath = path.join('./settings');


        //       url: 'http://www.dwarrant24.com/search?ul=' + sigBuy[j] + '&age=2&type=C&issuer%5B%5D=24&issuer%5B%5D=01&issuer%5B%5D=03&issuer%5B%5D=06&issuer%5B%5D=07&issuer%5B%5D=08&issuer%5B%5D=11&issuer%5B%5D=13&issuer%5B%5D=16&issuer%5B%5D=18&issuer%5B%5D=19&issuer%5B%5D=23&issuer%5B%5D=27&issuer%5B%5D=28&issuer%5B%5D=41&issuer%5B%5D=42&dwfilter=&filter-sense=0&filter-gearing=0&filter-timedecay=0'

        for (let j = 0; j < sigBuy.length; j++) {

            fs.readdir(directoryPath, function (err, files) {

                let time = files[0].split('_')[0]
                let exp = files[0].split('_')[1];
                let gear1 = files[0].split('_')[2];

                let val1 = ''
                let val2 = ''
                if (exp == 'ทั้งหมด') {
                    val1 = ''
                }
                if (exp == 'น้อยกว่า 1 เดือน') {
                    val1 = '0-30'
                }

                if (exp == 'น้อยกว่า 2 เดือน') {
                    val1 = '0-60'
                }

                if (exp == 'น้อยกว่า 3 เดือน') {
                    val1 = '0-90'
                }

                if (exp == 'น้อยกว่า 4 เดือน') {
                    val1 = '0-120'
                }

                if (exp == 'น้อยกว่า 5 เดือน') {
                    val1 = '0-150'
                }
                if (exp == 'น้อยกว่า 6 เดือน') {
                    val1 = '0-180'
                }
                if (exp == '> 6 เดือน') {
                    val1 = '180'
                }

                // + sigBuy[j] +
                request({
                    method: 'GET',
                    url: 'https://www.settrade.com/C13_DW.jsp?selectPage=2&underlying=' + 'JMT' + '&ttm=' + val1 + '&dwType=&firstTradeMonth=&issuer=&contractMonth='

                }, async (err, res, body) => {
                    await snooze(500);
                    if (err) return console.error(err);
                    let $ = cheerio.load(body);

                    let title = $('#maincontent > div > div:nth-child(1) > div.col-xs-12.col-lg-10.bodycontent > div > div.content-stt > div.row.separate-content > div:nth-child(4) > div > table > tbody').text();
                    let t = $('#maincontent > div > div:nth-child(1) > div.col-xs-12.col-lg-10.bodycontent > div > div.content-stt > div.row.separate-content > div:nth-child(4) > div > table > tbody > tr:nth-child(1) > td:nth-child(1)').text();
                    let num = title.split('                            ').length;


                    let name = [];
                    let gear = [];
                    let day = [];

                    for (let i = 1; i < (num / 11); i++) {
                        name.push(title.split('                            ')[i + 10 * (i - 1)].trim())
                        gear.push({
                            'id': i,
                            'val': title.split('                            ')[i + ((i - 1) * 10) + 6].trim().split(':')[0]})
                        day.push(title.split('                            ')[i + (i * 10)].trim())
                    }

              
                    if(gear1 == 'ทั้งหมด' ){
                        let max = 0;
                        let gearC = 0;
                        gear.forEach(gear => {
                            if (gear.val > max) {
                                max = gear.id;
                            }
                        });
    
                        console.log(gear[max-1].val  + '0')
                        if (title.length != 0) {
                            fs.createWriteStream(directory + '/CALL ' + name[max-1]);
                        }
    
                    }
    
                    if(gear1 == '0 - 0.8'){
                        let max = 0;
                        let gearC = 0;
                        gear.forEach(gear => {
                            if (gear.val > max) {
                                max = gear.id;
                            }
                        });
    
                        if (gear[max-1].val <= 0.8) {
                            fs.createWriteStream(directory + '/CALL ' + name[max-1]);
                        }
    
                    }
                    if(gear1 == '0.8 - 1.2' ){
       
                        let max = 0;
                        let gearC = 0;
                        gear.forEach(gear => {
                            if (gear.val > max) {
                                max = gear.id;
                            }
                        });
                   
                        console.log(gear[max-1].val )
                        if (gear[max-1].val > 0.8 ) {
                          
                            fs.createWriteStream(directory + '/CALL ' + name[max-1]);
                        }
    
                    }


                    if(gear1== '> 1.2' ){
                        let max = 0;
                        let gearC = 0;
                        gear.forEach(gear => {
                            if (gear.val > max) {
                                max = gear.id;
                            }
                        });
    
                        if(gear[max-1].val > 1.2  ) {
                            fs.createWriteStream(directory + '/CALL ' + name[max-1]);
                        }
    
                    }
                  
                });

            });
        }

        // for (let j = 0; j < sigSell.length; j++) {
        //     request({
        //         method: 'GET',
        //         url: 'http://www.dwarrant24.com/search?ul=' + sigSell[j] + '&age=2&type=P&issuer%5B%5D=24&issuer%5B%5D=01&issuer%5B%5D=03&issuer%5B%5D=06&issuer%5B%5D=07&issuer%5B%5D=08&issuer%5B%5D=11&issuer%5B%5D=13&issuer%5B%5D=16&issuer%5B%5D=18&issuer%5B%5D=19&issuer%5B%5D=23&issuer%5B%5D=27&issuer%5B%5D=28&issuer%5B%5D=41&issuer%5B%5D=42&dwfilter=&filter-sense=0&filter-gearing=0&filter-timedecay=0'

        //     }, (err, res, body) => {

        //         if (err) return console.error(err);

        //         let $ = cheerio.load(body);

        //         let title = $('#dwtable > tbody > tr > td.none-flag').text();
        //         let t = $('#dwtable > tbody > tr').text();

        //         if (t.length != 0) {
        //             title = $('#dwtable > tbody > tr > td.none-flag').text().split("\t\t\t\t\t\t\t");
        //             console.log(title[1]);
        //             fs.createWriteStream(directory + '/PUT ' + title[1].trim());
        //         }

        //     });

        // }

        res.json("Complete")

    } catch (error) {

    }
})






module.exports = router