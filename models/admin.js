const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const admin = sequelize.define(
  "admin",
  {
  
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
   
  
  }, {}
);


(async () => {
  await admin.sync({ force: false });
})();

module.exports = admin;
