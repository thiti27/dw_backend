const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const formular = sequelize.define(
    "formular",
    {   

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      use: {
        type: Sequelize.NUMBER,
        defaultValue: 0
      },
    }
    
  );
  (async () => {
    await formular.sync({ force: false });    
  })();

  
module.exports = formular;
