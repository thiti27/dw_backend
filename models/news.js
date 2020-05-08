const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const news = sequelize.define(
    "news",
    {      
      msg: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pic: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "-"
      },
     
    },
    {
      // options
    }
  );


(async () => {
  await news.sync({ force: false });    
})();

  
module.exports = news;
