const Agenda = require('agenda');
const { subDays } = require('date-fns');

const pubsub = require('./pubsub');
const getMongoDb = require('./mongoDb');
const signale = require('./logger');
const { decrypt } = require('./utils');

let agenda = null;

const createAgenda = async () => {
  const mongo = await getMongoDb();
  // elimino i job con nome 'delete completed jobs'
  mongo.collection('agendaJobs').deleteMany({
    name: { $eq: 'delete completed jobs' }
  });
  const agenda_output = new Agenda({
    mongo
  });
  agenda_output.define('send echo', (job, done) => {
    done();
  });
  agenda_output.define('delete completed jobs', async (job, done) => {
    const { deletedCount } = await mongo.collection('agendaJobs').deleteMany({
      nextRunAt: { $eq: null },
      lastRunAt: { $lt: subDays(new Date(), 1) }
    });
    signale.complete(`Job '${job.attrs.name}': ${deletedCount}`);
    done();
  });
  agenda_output.every('3 hours', 'delete completed jobs');
  agenda_output.on('success:send echo', async job => {
    let reminder = {
      id: job.attrs._id,
      to: job.attrs.data.to,
      text: decrypt(job.attrs.data.text),
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      disabled: job.attrs.disabled
    };

    if (job.attrs.data.interval) {
      let newJob = await agenda.create('send echo', {
        to: job.attrs.data.to,
        text: job.attrs.data.text
      });
      newJob.repeatEvery(job.attrs.data.interval, { skipImmediate: true });
      newJob = await newJob.save();
      reminder = {
        ...reminder,
        id: newJob.attrs._id,
        nextRunAt: newJob.attrs.nextRunAt
      };
    }

    pubsub.publish('reminderCompleted', { reminderCompleted: { ...reminder } });
  });
  return agenda_output;
};

module.exports = getAgenda = () =>
  new Promise(async (resolve, reject) => {
    try {
      if (agenda) return resolve(agenda);
      agenda = await createAgenda();
      resolve(agenda);
    } catch (error) {
      return reject(error);
    }
  });
