const express = require("express");
const router = express.Router();
const formular = require("./models/formular");
const user = require("./models/user");
const buy = require("./models/buy");
const sell = require("./models/sell");
const Sequelize = require("sequelize");
const constants = require("./constant");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const Op = Sequelize.Op;

router.post("/add", async (req, res) => {

    try {

        const result = await formular.create({
            name: req.body.name,
        });
        res.json({
            result: constants.kResultOk,
            message: result.id,
        });

    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
    }
})

router.post("/sell", async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (error, fields, files) => {
            let result = await sell.create(fields)
            res.json({
                result: constants.kResultOk,
            });
        })

    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
    }
})

router.post("/buy", async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (error, fields, files) => {
            console.log(fields)
            let result = await buy.create(fields)
            res.json({
                result: constants.kResultOk,
            });
        })

    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
    }
})

router.get("/getAll", async (req, res) => {

    let result = await formular.findAll({
        where: {

        }, order: Sequelize.literal("id DESC")
        ,
        limit: 20
    })
    res.json(result);
})

router.get("/buy/:id", async (req, res) => {
    try {
        let result = await buy.findAll({ where: { for_id: req.params.id } })
        console.log(JSON.stringify(result))
        res.json(result);
    } catch (error) {
        res.json({});
    }
})
router.get("/sell/:id", async (req, res) => {
    try {
        let result = await sell.findAll({ where: { for_id: req.params.id } })
        res.json(result);
    } catch (error) {
        res.json({});
    }
})


router.put("/name", async (req, res) => {
    try {
        let result = await formular.update({ name: req.body.name }, { where: { id: req.body.id } });
        res.json({
            result: constants.kResultOk,
            message: result.id,
        });

    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})

router.get("/name/:id", async (req, res) => {
    try {
        let result = await formular.findOne({ where: { id: req.params.id } })
        console.log(JSON.stringify(result.name))
        res.json(result.name);
    } catch (error) {
        res.json({});
    }
})

router.delete("/updateAll/:id", async (req, res) => {
    try {
        const { id } = req.params
        await sell.destroy({ where: { for_id: id } });
        await buy.destroy({ where: { for_id: id } });
        res.json({ result: constants.kResultOk });
    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})

router.delete("/deleteAll/:id", async (req, res) => {
    try {
        const { id } = req.params
        await formular.destroy({ where: { id: id } });
        await sell.destroy({ where: { for_id: id } });
        await buy.destroy({ where: { for_id: id } });
        res.json({ result: constants.kResultOk });
    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})

router.put("/choose", async (req, res) => {
    try {
        await formular.update({ use : '0' }, { where: { use : '1'  } });
        await formular.update({ use : '1' }, { where: { id: req.body.id } });
        res.json({ result: constants.kResultOk });

    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})

router.get("/keyword/:keyword", async (req, res) => {
    const { keyword } = req.params;
    let result = await formular.findAll({ where: { name: {[Op.like]: `%${keyword}%`} } });
    res.json(result);
  });


module.exports = router