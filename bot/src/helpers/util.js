const { createToken } = require('../graphql/graphqlClient');

exports.startDate = Math.round(Date.now() / 1000);

exports.shortenText = (text, maxLength = 124) => {
  if (text && text.length > maxLength) {
    return `${text.substring(0, maxLength)} ...`;
  }

  return text;
};
