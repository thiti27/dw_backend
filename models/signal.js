const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const signal = sequelize.define(
    "signal",
    {

        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        buy: {
            type: Sequelize.NUMBER,
            allowNull: false,
        }, 
        sell: {
            type: Sequelize.NUMBER,
            allowNull: false,
        },


    }, {}
);


(async () => {
    await signal.sync({ force: false });
})();

module.exports = signal;
