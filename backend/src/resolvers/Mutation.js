const { forwardTo } = require('prisma-binding');
const ObjectId = require('mongodb').ObjectID;
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const parser = require('cron-parser');

const { hasPermission, encrypt } = require('../utils');

const Mutation = {
  async createUser(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    if (!hasPermission(ctx.user, ['BOT'])) throw new Error('Unauthorized!');
    return forwardTo('prismaDb')(parent, args, ctx, info);
  },
  async scheduleReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    let { text, when } = args;
    const parsedDate = Date.parse(when);
    if (!isNaN(parsedDate)) when = new Date(parsedDate);
    if (Object.prototype.toString.call(when) === '[object Date]') {
      if (when < new Date()) throw new Error('Invalid date!');
    }
    const job = await ctx.agenda.schedule(when, 'send echo', {
      to: tgid,
      text: encrypt(text)
    });
    return {
      id: job.attrs._id,
      to: job.attrs.data.to,
      text,
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      disabled: job.attrs.disabled
    };
  },
  async intervalReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { text, interval } = args;
    let job = await ctx.agenda.create('send echo', {
      to: tgid,
      text: encrypt(text)
    });
    try {
      const intervalCron = parser.parseExpression(interval);
      const nextIntervals = [
        intervalCron.next(),
        intervalCron.next(),
        intervalCron.next(),
        intervalCron.next()
      ];
      const dateDiff = Math.round(
        (nextIntervals[3].getTime() - nextIntervals[2].getTime()) / 1000
      );
      if (dateDiff < 1800) {
        // at least the interval more than 1800 seconds (30 minutes)
        throw new Error('Interval too small!');
      }
    } catch (error) {}
    job.repeatEvery(interval, { skipImmediate: true });
    job = await job.save();
    if (!job.attrs.nextRunAt) {
      throw new Error('Invalid interval!');
    }
    return {
      id: job.attrs._id,
      to: job.attrs.data.to,
      text,
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      disabled: job.attrs.disabled
    };
  },
  async delayedIntervalReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    let { text, interval, from } = args;
    const parsedDate = Date.parse(from);
    if (!isNaN(parsedDate)) {
      from = new Date(parsedDate);
    } else {
      throw new Error('Invalid date!');
    }
    if (
      Object.prototype.toString.call(from) !== '[object Date]' ||
      from < new Date()
    ) {
      throw new Error('Invalid date!');
    }
    const job = await ctx.agenda.schedule(from, 'send echo', {
      to: tgid,
      text: encrypt(text),
      interval
    });
    return {
      id: job.attrs._id,
      to: job.attrs.data.to,
      text,
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      disabled: job.attrs.disabled
    };
  },
  async removeReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { remId } = args;
    const jobs = await ctx.agenda.jobs({
      _id: new ObjectId(remId),
      'data.to': tgid
    });
    if (!jobs || jobs.length != 1) return false;
    const job = jobs[0];
    await job.remove();
    return true;
  },
  async disableReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { remId } = args;
    const jobs = await ctx.agenda.jobs({
      _id: new ObjectId(remId),
      'data.to': tgid
    });
    if (!jobs || jobs.length != 1) return false;
    const job = jobs[0];
    await (await job.disable()).save();
    return true;
  },
  async enableReminder(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { remId } = args;
    const jobs = await ctx.agenda.jobs({
      _id: new ObjectId(remId),
      'data.to': tgid
    });
    if (!jobs || jobs.length != 1) return false;
    const job = jobs[0];
    await (await job.enable()).save();
    return true;
  },
  async updateState(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const { newState } = args;
    return ctx.prismaDb.mutation.updateUser(
      {
        data: { state: newState },
        where: { tgid }
      },
      info
    );
  },
  async requestUrl(parent, args, ctx, info) {
    if (!ctx.user) throw new Error('Not Authenticated!');
    const { tgid } = ctx.user;
    const randomBytesPromiseified = promisify(randomBytes);
    const urlToken = (await randomBytesPromiseified(20)).toString('hex');
    const url = `${process.env.FRONTEND_URL}?user=${tgid}&token=${urlToken}`;
    const urlTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const user = await ctx.prismaDb.mutation.updateUser({
      data: { urlToken, urlTokenExpiry },
      where: { tgid }
    });
    const urlExpiry = user.urlTokenExpiry;
    return { url, urlExpiry };
  },
  async login(parent, args, ctx, info) {
    const { userId, urlToken } = args;
    const user = await ctx.prismaDb.query.user({
      where: { tgid: userId }
    });
    if (
      !user ||
      user.urlToken !== urlToken ||
      user.urlTokenExpiry <= Date.now()
    ) {
      throw new Error('User not found or invalid token!');
    }
    const expirationSeconds = Math.round(
      (user.urlTokenExpiry - Date.now()) / 1000
    );
    const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
      expiresIn: expirationSeconds
    });
    ctx.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * expirationSeconds
    });
    return ctx.prismaDb.query.user(
      {
        where: { tgid: userId }
      },
      info
    );
  },
  async logout(parent, args, ctx, info) {
    ctx.res.clearCookie('token');
    return true;
  }
};

module.exports = Mutation;
