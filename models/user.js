const Sequelize = require("sequelize");
const sequelize = require("./../db_instance");

const user = sequelize.define(
  "user",
  {
  
    f_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    l_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    active: {
      type: Sequelize.NUMBER,
      defaultValue: 0
    },

  }, {}
);


(async () => {
  await user.sync({ force: false });
})();

module.exports = user;
