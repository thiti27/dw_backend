const express = require("express");
const router = express.Router();
const news = require("./models/news");
const user = require("./models/user");
const Sequelize = require("sequelize");
const constants = require("./constant");
const formidable = require("formidable");
var request = require('request');
const path = require("path");
const fs = require("fs-extra");
const Op = Sequelize.Op;
const LineNotify = require("./line-notify/client");
// Upload Image
uploadImage = async (files, doc) => {
    if (files.image != null) {
        var fileExtention = files.image.name.split(".")[1];
        doc.image = `${doc.id}.${fileExtention}`;
        var newpath =
            path.resolve(__dirname + "/uploaded/images/") + "/" + doc.image;
        if (fs.exists(newpath)) {
            await fs.remove(newpath);
        }
        await fs.moveSync(files.image.path, newpath);

        // Update database
        let result = news.update(
            { pic: doc.image },
            { where: { id: doc.id } }
        );
        return doc.image;
    }
};

router.post("/add", async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (error, fields, files) => {
            let result = await news.create(fields);
            result = await uploadImage(files, result);
            let img = result
            let send = await user.findAll({

                where: {
                    active: '1'
                }
                ,
            })
            for (let i = 0; i < send.length; i++) {
                const ACCESS_TOKEN = send[i].token;
                const notify = new LineNotify(`${ACCESS_TOKEN}`);
                notify.sendText(fields.msg);
                notify.sendImage("./uploaded/images/" + img);
            }

            res.json({
                result: constants.kResultOk,
            });
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
    }
})

router.get("/show", async (req, res) => {

    let result = await news.findAll({
        where: {

        }, order: Sequelize.literal("id DESC")
        ,
        limit: 20
    })
    res.json(result);
})
router.get("/keyword/:keyword", async (req, res) => {
    const { keyword } = req.params;
    let result = await news.findAll({ where: { msg: { [Op.like]: `%${keyword}%` } } });
    res.json(result);
});

async function f1(msg) {
    try {
        console.log(msg)
        let send = await user.findAll({

            where: {
                active: '1'
            }
            ,
        })
        for (let i = 0; i < send.length; i++) {
            const ACCESS_TOKEN = send[i].token;
            const notify = new LineNotify(`${ACCESS_TOKEN}`);
            notify.sendText(msg);
        }

    } catch (error) {

    }
}

//send Signal to Line 

router.get("/signal", async (req, res) => {
    try {
        const directoryPath = path.join('./lastrow');
        // passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            let a = [];
            files.forEach(function (file) {
                a.push(file)
            });

  
            var today = new Date();
            var dd = today.getDate();

            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }

            if (mm < 10) {
                mm = '0' + mm;
            }

            // today = dd + '/' + mm + '/' + yyyy;
            today = '01/04/2020'
            let send1 = '';
            let msg = '';
            let test = "\n\nสัญญาณ ซื้อ-ขาย หุ้น DW \nวันที่ " + today + "\n"

            if(a.length != 0 ){
                for (let i = 0; i < a.length; i++) {
                    send1 += "\n" + a[i];
                }
                msg = test + send1
                f1(msg)
                res.json({
                    result: constants.kResultOk,
                });
            }
            if(a.length == 0 ){
              
                    send1 += "\nไม่พบสัญญาณ ซื้อ-ขาย " ;
               
                msg = test + send1
                f1(msg)
                res.json({
                    result: constants.kResultOk,
                });
            }
          

        });
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
    }



});





module.exports = router