const express = require("express");
const router = express.Router();
const user = require("./models/user");
const Sequelize = require("sequelize");
const constants = require("./constant");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const Op = Sequelize.Op;

router.post("/add", async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (error, fields, files) => {
            let result = await user.create(fields);
            res.json({
                result: constants.kResultOk,
                message: JSON.stringify(result)
            });
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
    }
})

router.get("/show", async (req, res) => {

    let result = await user.findAll({
        where: {

        }, order: Sequelize.literal("id DESC")
        ,
        limit: 20
    })
    res.json(result);
})

router.get("/data/:id", async (req, res) => {

    try {
        let result = await user.findOne({ where: { id: req.params.id } })
        console.log(JSON.stringify(result))
        res.json(result);
    } catch (error) {
        res.json({});
    }
})

router.put("/active", async (req, res) => {
    try {
        let result = await user.update({ active: '0' }, { where: { id: req.body.id } });
        res.json({
            result: constants.kResultOk,
        });

    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})

router.put("/unActive", async (req, res) => {
    try {
        let result = await user.update({ active: '1' }, { where: { id: req.body.id } });
        res.json({
            result: constants.kResultOk,
        });

    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})

router.get("/keyword/:keyword", async (req, res) => {
    const { keyword } = req.params;
    let result = await user.findAll({ where: { f_name: { [Op.like]: `%${keyword}%` } } });
    res.json(result);
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params
        await user.destroy({ where: { id: id } });
        res.json({ result: constants.kResultOk });
    } catch (err) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(err) });
    }
})


module.exports = router