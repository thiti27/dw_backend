const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const sell = sequelize.define(
  "sell",
  {
    indy1: {
      type: Sequelize.STRING,
      allowNull: false
    },
    val1: {
      type: Sequelize.STRING,
      allowNull: false
    },
    compare: {
      type: Sequelize.STRING,
      allowNull: false
    },

    indy2: {
      type: Sequelize.STRING,
      allowNull: false
    },
    val2: {
      type: Sequelize.STRING,
      allowNull: false
    },
    for_id: {
      type: Sequelize.NUMBER,
      allowNull: false
    },
  }

);
(async () => {
  await sell.sync({ force: false });
})();


module.exports = sell;
