const path = require('path');

const signale = require('./logger');

const prod = process.env.NODE_ENV === 'production';

signale.info(`script started in '${process.env.NODE_ENV}' mode!`);

let envPath = '';
if (prod) {
  envPath = path.join(__dirname, '..', '.env.production');
} else {
  envPath = path.join(__dirname, '..', '.env.development');
}
require('dotenv').config({ path: envPath });

const bot = require('./telegraf');
require('./botCore');

signale.start('start polling');
bot.startPolling();
