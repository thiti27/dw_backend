const express = require("express");
const router = express.Router();
var yahooFinance = require('yahoo-finance');
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
var format = require('date-format');
var datetime = require('node-datetime');

router.get("/fetch", async (req, res) => {
  var dt = datetime.create();
  var formatted = dt.format('Y-m-d');

  let directory = './data'
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });

  const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {

    let stock_name1 = ['AAV.BK', 'ADVANC.BK', 'AEONTS.BK',
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

    let start_date = '2018-01-01'
    let end_date =  '2020-04-02' // formatted

    for (let i = 0; i < stock_name1.length; i++) {
      await snooze(500);
      yahooFinance.historical({
        symbol: stock_name1[i],
        from: start_date,
        to: end_date,
        // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
      }, function (err, quotes) {
        quotes.reverse()
        const records = [

        ];

        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
          path: './data/_' + stock_name1[i] + '.csv',
          header: [
            { id: 'date', title: 'date' },
            { id: 'open', title: 'open' },
            { id: 'high', title: 'high' },
            { id: 'low', title: 'low' },
            { id: 'close', title: 'close' },
          ]
        });

        for (let p = 0; p < quotes.length; p++) {
          records.push({
            date: format('dd/MM/yy', quotes[p].date),
            open: quotes[p].open,
            high: quotes[p].high,
            low: quotes[p].low,
            close: quotes[p].close
          })
        }
        csvWriter.writeRecords(records)       // returns a promise


        fs.readdir(directory, (err, files) => {
          console.log(files.length + " " + stock_name1[i])
          if (files.length == 98) {
            res.json("Data Set 1 Complete")
          }
        });
      });


    }

  } catch (error) {

  }


})

module.exports = router