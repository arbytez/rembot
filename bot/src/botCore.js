const bot = require('./telegraf');
const signale = require('./logger');

// bot middlewares
require('./botMiddlewares');

// bot callback
require('./botCallback');

// bot commands
require('./botCommands');

// bot events
require('./botEvents');

// bot catch errors
bot.catch(error => {
  signale.error(error);
});
