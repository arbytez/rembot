// https://github.com/hasura/graphqurl

const { query } = require('graphqurl');
const jwt = require('jsonwebtoken');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const { distanceInWordsToNow, format } = require('date-fns');

const bot = require('../telegraf');
const signale = require('../logger');
const {
  GET_USER_QUERY,
  GET_REMINDERS_QUERY,
  GET_ALL_REMINDERS_QUERY,
  COUNT_REMINDERS_QUERY,
  COUNT_ALL_REMINDERS_QUERY,
  GET_REMINDER_QUERY
} = require('./queries');

const {
  CREATE_USER_MUTATION,
  SCHEDULE_REMINDER_MUTATION,
  INTERVAL_REMINDER_MUTATION,
  REMOVE_REMINDER_MUTATION,
  DISABLE_REMINDER_MUTATION,
  ENABLE_REMINDER_MUTATION,
  UPDATE_STATE_MUTATION,
  DELAYED_INTERVAL_REMINDER_MUTATION,
  REQUEST_URL_MUTATION,
  LOGIN_MUTATION
} = require('./mutations');

const { REMINDER_COMPLETED_SUBSCRIPTION } = require('./subscriptions');

const endpoint = process.env.ENDPOINT;

const createToken = user => {
  const token = jwt.sign({ ...user }, process.env.JWT_SECRET);
  return token;
};
exports.createToken = createToken;

const userBotToken = createToken({ roles: ['BOT'] });

exports.getUser = async tgid => {
  const res = await query({
    query: GET_USER_QUERY,
    variables: { tgid },
    endpoint,
    headers: {
      authorization: userBotToken
    }
  });
  const user = res.data.getUser;
  return user;
};

exports.getReminders = async (token, skip, limit) => {
  const res = await query({
    query: GET_REMINDERS_QUERY,
    variables: { skip, limit },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const reminders = res.data.getReminders;
  return reminders;
};

exports.getReminder = async (token, remId) => {
  const res = await query({
    query: GET_REMINDER_QUERY,
    variables: { remId },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const reminder = res.data.getReminder;
  return reminder;
};

exports.getAllReminders = async (token, skip, limit) => {
  const res = await query({
    query: GET_ALL_REMINDERS_QUERY,
    variables: { skip, limit },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const allReminders = res.data.getAllReminders;
  return allReminders;
};

exports.countReminders = async token => {
  const res = await query({
    query: COUNT_REMINDERS_QUERY,
    endpoint,
    headers: {
      authorization: token
    }
  });
  const countReminders = res.data.countReminders;
  return countReminders;
};

exports.countAllReminders = async token => {
  const res = await query({
    query: COUNT_ALL_REMINDERS_QUERY,
    endpoint,
    headers: {
      authorization: token
    }
  });
  const countAllReminders = res.data.countAllReminders;
  return countAllReminders;
};

exports.createUser = async tgid => {
  const res = await query({
    query: CREATE_USER_MUTATION,
    variables: { tgid },
    endpoint,
    headers: {
      authorization: userBotToken
    }
  });
  const newUser = res.data.createUser;
  return newUser;
};

exports.updateState = async (token, newState) => {
  const res = await query({
    query: UPDATE_STATE_MUTATION,
    variables: { newState },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const updatedUser = res.data.updateState;
  return updatedUser;
};

exports.scheduleReminder = async (token, text, when) => {
  const res = await query({
    query: SCHEDULE_REMINDER_MUTATION,
    variables: { text, when },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const scheduleReminder = res.data.scheduleReminder;
  return scheduleReminder;
};

exports.intervalReminder = async (token, text, interval) => {
  const res = await query({
    query: INTERVAL_REMINDER_MUTATION,
    variables: { text, interval },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const intervalReminder = res.data.intervalReminder;
  return intervalReminder;
};
exports.delayedIntervalReminder = async (token, text, interval, from) => {
  const res = await query({
    query: DELAYED_INTERVAL_REMINDER_MUTATION,
    variables: { text, interval, from },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const delayedIntervalReminder = res.data.delayedIntervalReminder;
  return delayedIntervalReminder;
};

exports.removeReminder = async (token, remId) => {
  const res = await query({
    query: REMOVE_REMINDER_MUTATION,
    variables: { remId },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const removeReminder = res.data.removeReminder;
  return removeReminder;
};

exports.disableReminder = async (token, remId) => {
  const res = await query({
    query: DISABLE_REMINDER_MUTATION,
    variables: { remId },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const disableReminder = res.data.disableReminder;
  return disableReminder;
};

exports.enableReminder = async (token, remId) => {
  const res = await query({
    query: ENABLE_REMINDER_MUTATION,
    variables: { remId },
    endpoint,
    headers: {
      authorization: token
    }
  });
  const enableReminder = res.data.enableReminder;
  return enableReminder;
};

exports.requestUrl = async token => {
  const res = await query({
    query: REQUEST_URL_MUTATION,
    endpoint,
    headers: {
      authorization: token
    }
  });
  const url = res.data.requestUrl;
  return url;
};

exports.login = async (userId, urlToken) => {
  const res = await query({
    query: LOGIN_MUTATION,
    variables: { userId, urlToken },
    endpoint
  });
  const user = res.data.login;
  return user;
};

exports.reminderCompleted = async () => {
  const subObservable = await query({
    query: REMINDER_COMPLETED_SUBSCRIPTION,
    endpoint,
    headers: {
      authorization: userBotToken
    }
  });
  subObservable.subscribe(
    event => {
      const { id, to, text, nextRunAt } = event.data.reminderCompleted;
      if (nextRunAt) {
        let res = `${text}`;
        res += `\n\nNext run will be on: ${format(
          nextRunAt,
          'ddd MMM DD YYYY HH:mm:ss'
        )} (in ${distanceInWordsToNow(nextRunAt)})`;
        let inlineButtons = [];
        inlineButtons.push(
          Markup.callbackButton('Disable', `reminderAction$disable$${id}$${1}`),
          Markup.callbackButton('Remove', `reminderAction$remove$${id}$${1}`)
        );
        const keyboard = Markup.inlineKeyboard(inlineButtons);
        bot.telegram.sendMessage(to, res, Extra.markup(keyboard));
      } else {
        let inlineButtons = [];
        inlineButtons.push(
          Markup.callbackButton(
            '15 min',
            `reminderAction$create$${id}$15 minutes`
          ),
          Markup.callbackButton(
            '30 min',
            `reminderAction$create$${id}$30 minutes`
          ),
          Markup.callbackButton('1 hour', `reminderAction$create$${id}$1 hour`),
          Markup.callbackButton(
            '6 hours',
            `reminderAction$create$${id}$6 hours`
          ),
          Markup.callbackButton('1 day', `reminderAction$create$${id}$1 day`)
        );
        const keyboard = Markup.inlineKeyboard(inlineButtons);
        let res = `${text}`;
        res += `\n\nRemind me again in:`;
        bot.telegram.sendMessage(to, res, Extra.markup(keyboard));
      }
    },
    error => {
      signale.error(error);
    }
  );
};
