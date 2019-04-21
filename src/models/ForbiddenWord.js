'use strict';
module.exports = (sequelize, DataTypes) => {
  const ForbiddenWord = sequelize.define('forbiddenWord', {
    word: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
  }, {});

  ForbiddenWord.associate = function(models) {
    ForbiddenWord.belongsTo(models.organization);
  };

  return ForbiddenWord;
};
