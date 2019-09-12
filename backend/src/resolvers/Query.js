const ObjectId = require('mongodb').ObjectID;

const { hasPermission, decrypt } = require('../utils');

const Query = {
  async me(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    return ctx.prismaDb.query.user(
      {
        where: { tgid }
      },
      info
    );
  },
  async getUser(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    if (!hasPermission(ctx.user, ['BOT'])) throw new Error('Unauthorized!');
    const { tgid } = args;
    return ctx.prismaDb.query.user(
      {
        where: { tgid }
      },
      info
    );
  },
  async getReminders(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { skip = 0, limit = 7 } = args;
    const reminders = await ctx.mongoDb
      .collection('agendaJobs')
      .find({
        data: { $ne: null },
        'data.to': tgid,
        nextRunAt: { $ne: null }
      })
      .skip(skip)
      .limit(limit)
      .sort({ nextRunAt: 1 })
      .toArray();
    return reminders.map(reminder => {
      return {
        id: reminder._id,
        to: reminder.data.to,
        text: decrypt(reminder.data.text),
        nextRunAt: reminder.nextRunAt,
        lastRunAt: reminder.lastRunAt,
        disabled: reminder.disabled
      };
    });
  },
  async getReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { remId } = args;
    const reminder = await ctx.mongoDb.collection('agendaJobs').findOne({
      _id: new ObjectId(remId),
      data: { $ne: null },
      'data.to': tgid
    });
    return {
      id: reminder._id,
      to: reminder.data.to,
      text: decrypt(reminder.data.text),
      nextRunAt: reminder.nextRunAt,
      lastRunAt: reminder.lastRunAt,
      disabled: reminder.disabled
    };
  },
  async countReminders(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const counter = await ctx.mongoDb
      .collection('agendaJobs')
      .find({
        data: { $ne: null },
        'data.to': tgid,
        nextRunAt: { $ne: null }
      })
      .count();
    return counter;
  },
  async getAllReminders(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    if (!hasPermission(ctx.user, ['ADMIN'])) throw new Error('Unauthorized!');
    const { skip = 0, limit = 7 } = args;
    const reminders = await ctx.mongoDb
      .collection('agendaJobs')
      .find({
        data: { $ne: null },
        nextRunAt: { $ne: null }
      })
      .skip(skip)
      .limit(limit)
      .sort({ nextRunAt: 1 })
      .toArray();
    return reminders.map(reminder => {
      return {
        id: reminder._id,
        to: reminder.data.to,
        text: reminder.data.text.encryptedData, // decrypt(reminder.data.text),
        nextRunAt: reminder.nextRunAt,
        lastRunAt: reminder.lastRunAt,
        disabled: reminder.disabled
      };
    });
  },
  async countAllReminders(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    if (!hasPermission(ctx.user, ['ADMIN'])) throw new Error('Unauthorized!');
    const counter = await ctx.mongoDb
      .collection('agendaJobs')
      .find({
        data: { $ne: null },
        nextRunAt: { $ne: null }
      })
      .count();
    return counter;
  }
};

module.exports = Query;
