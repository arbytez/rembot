const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const { Signale } = require('signale');

const logsDir = path.join(__dirname, 'logs');
const logFileName = `${format(new Date(), 'YYYY-MM-DD HH.mm.ss')}.log`;

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const stream = fs.createWriteStream(path.join(logsDir, logFileName), {
  flags: 'w'
});

const options = {
  stream: [process.stdout, stream]
};

const signale = new Signale(options);

signale.config({
  displayFilename: true,
  displayTimestamp: true,
  displayDate: true
});

module.exports = signale;
