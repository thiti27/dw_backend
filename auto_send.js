const express = require("express");
const router = express.Router();
const constants = require("./constant");
var schedule = require('node-schedule');
const axios = require('axios');
var instance = axios.create({ baseURL: 'http://localhost:8085/api/data' });
var calculate = axios.create({ baseURL: 'http://localhost:8085/api/cal' });
var signal = axios.create({ baseURL: 'http://localhost:8085/api/signal' });
var news = axios.create({ baseURL: 'http://localhost:8085/api/news' });
var format = require('date-format');
var datetime = require('node-datetime');
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
try {

    var dt = datetime.create();
    var formatted = dt.format('Y-m-d');

    let end_date = formatted
    console.log(end_date)

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = 19;
    rule.minute = 0;
    var j = schedule.scheduleJob(rule, function () {

        ///Get last Row to Check in it!!! 




    });

} catch (error) {

}


async function getData() {

    return await instance.get('/fetch');
}

async function getCal1() {
    return await calculate.get('/buy')
}
async function getCal2() {
    return await calculate.get('/sell')
}
async function getCal3() {
    return await calculate.get('/findbuy')
}
async function getCal4() {
    return await calculate.get('/findsell')
}
async function getBacktest() {
    return await signal.get('/backtest')
}
async function getLastrow() {
    return await signal.get('/lastrow')
}
async function sendSignal() {
    return await news.get('/signal')
}
function test() {
    console.log("SERVER END .... ")
}

async function main() {
    try {
        // await getData();
        // await snooze(1000);
        // await getCal1();
        // await snooze(1000);
        // await getCal2();
        // await snooze(1000);
        // await getCal3();  
        // await snooze(1000);
        // await getCal4();

        // await snooze(1000);
        // await getBacktest();
        // await snooze(1000);
        await getLastrow();
        // await snooze(1000);
        // await sendSignal();

        test();
    } catch (error) {
        console.log(error)
    }
}
main();
//


