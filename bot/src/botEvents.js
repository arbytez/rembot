const {
  distanceInWordsToNow,
  format,
  addDays,
  addSeconds,
  addMinutes,
  addMonths,
  addHours,
  addYears,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday
} = require('date-fns');
const parser = require('cron-parser');

const bot = require('./telegraf');
const signale = require('./logger');
const {
  scheduleReminder,
  reminderCompleted,
  updateState,
  intervalReminder,
  delayedIntervalReminder
} = require('./graphql/graphqlClient');

// subscription to the reminders completed
reminderCompleted();

// handle text messages
bot.on('text', async (ctx, next) => {
  const { text } = ctx.message;
  if (!text) return next();
  const [state, key] = ctx.state.state.toLowerCase().split('$');
  switch (state) {
    case 'main':
      await handleMain(ctx);
      break;
    case 'setcroninterval':
      await handleSetCronInterval(ctx);
      break;
    case 'settextinterval':
      await handleSetTextInterval(ctx, key);
      break;
    default:
      break;
  }
});

const handleMain = async ctx => {
  await handleMainNew(ctx);
};

const handleMainNew = async ctx => {
  let { text } = ctx.message;
  text = text.toLowerCase();

  const inPattern = /^\s*in\s+(\d+)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s+(.*)$/;
  const inPatternAlt = /^\s*in\s+(\d+)\s*(s|m|h|d|w|mm|y)\s+(.*)$/;
  const dayPattern = /^\s*on\s+(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+at\s+(\d{1,2})(\:|\.)(\d{1,2})\s+(.*)$/;
  const dayPatternAlt = /^\s*on\s+(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+at\s+(\d{1,2})\s+(.*)$/;
  const dayPatternAltAlt = /^\s*on\s+(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+(.*)$/;
  const onAtPattern = /^\s*on\s+(\d{1,2})(\/|\-)(\d{1,2})(\/|\-)(\d{4})\s+at\s+(\d{1,2})(\:|\.)(\d{1,2})\s+(.*)$/;
  const onAtPatternAlt = /^\s*on\s+(\d{1,2})(\/|\-)(\d{1,2})\s+at\s+(\d{1,2})(\:|\.)(\d{1,2})\s+(.*)$/;
  const onAtPatternAltAlt = /^\s*on\s+(\d{1,2})(\/|\-)(\d{1,2})\s+at\s+(\d{1,2})\s+(.*)$/;
  const onPattern = /^\s*on\s+(\d{1,2})(\/|\-)(\d{1,2})(\/|\-)(\d{4})\s+(.*)$/;
  const onPatternAlt = /^\s*on\s+(\d{1,2})(\/|\-)(\d{1,2})\s+(.*)$/;
  const atPattern = /^\s*at\s+(\d{1,2})(\:|\.)(\d{1,2})\s+(.*)$/;
  const atPatternAlt = /^\s*at\s+(\d{1,2})\s+(.*)$/;
  const tomorrowPattern = /^\s*tomorrow\s+at\s+(\d{1,2})(\:|\.)(\d{1,2})\s+(.*)$/;
  const tomorrowPatternAlt = /^\s*tomorrow\s+at\s+(\d{1,2})\s+(.*)$/;
  const tomorrowPatternAltAlt = /^\s*tomorrow\s+(.*)$/;
  const everyPattern = /^\s*every\s+(\d+)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s+(.*)$/;
  const everyPatternAlt = /^\s*every\s+(\d+)\s*(s|m|h|d|w|mm|y)\s+(.*)$/;
  const everyDelayedPattern = /^\s*from\s+(\d{1,2})(\/|\-)(\d{1,2})(\/|\-)(\d{4})\s+at\s+(\d{1,2})(\:|\.)(\d{1,2})\s+every\s+(\d+)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s+(.*)$/;

  const textParsed_inPattern = text.match(inPattern);
  const textParsed_inPatternAlt = text.match(inPatternAlt);
  const textParsed_dayPattern = text.match(dayPattern);
  const textParsed_dayPatternAlt = text.match(dayPatternAlt);
  const textParsed_dayPatternAltAlt = text.match(dayPatternAltAlt);
  const textParsed_onAtPattern = text.match(onAtPattern);
  const textParsed_onAtPatternAlt = text.match(onAtPatternAlt);
  const textParsed_onAtPatternAltAlt = text.match(onAtPatternAltAlt);
  const textParsed_onPattern = text.match(onPattern);
  const textParsed_onPatternAlt = text.match(onPatternAlt);
  const textParsed_atPattern = text.match(atPattern);
  const textParsed_atPatternAlt = text.match(atPatternAlt);
  const textParsed_tomorrowPattern = text.match(tomorrowPattern);
  const textParsed_tomorrowPatternAlt = text.match(tomorrowPatternAlt);
  const textParsed_tomorrowPatternAltAlt = text.match(tomorrowPatternAltAlt);
  const textParsed_everyPattern = text.match(everyPattern);
  const textParsed_everyPatternAlt = text.match(everyPatternAlt);
  const textParsed_everyDelayedPattern = text.match(everyDelayedPattern);

  let schedDate;
  let numTime;
  let strTime;
  let mess;
  let day, dayName, month, year, hour, minute;
  let isEvery = false;
  let isEveryDelayed = false;

  if (textParsed_inPattern) {
    numTime = textParsed_inPattern[1];
    strTime = textParsed_inPattern[2];
    mess = textParsed_inPattern[3];
    if (mess) schedDate = calcNextInDate(numTime, strTime);
  } else if (textParsed_inPatternAlt) {
    numTime = textParsed_inPatternAlt[1];
    strTime = textParsed_inPatternAlt[2];
    mess = textParsed_inPatternAlt[3];
    if (mess) schedDate = calcNextInDate(numTime, strTime);
  } else if (textParsed_dayPattern) {
    dayName = textParsed_dayPattern[1];
    hour = parseInt(textParsed_dayPattern[2]);
    minute = parseInt(textParsed_dayPattern[4]);
    mess = textParsed_dayPattern[5];
    if (mess) {
      schedDate = calcDayNameDate(dayName);
      schedDate = new Date(
        schedDate.getFullYear(),
        schedDate.getMonth(),
        schedDate.getDate(),
        hour,
        minute
      );
    }
  } else if (textParsed_dayPatternAlt) {
    dayName = textParsed_dayPatternAlt[1];
    hour = parseInt(textParsed_dayPatternAlt[2]);
    mess = textParsed_dayPatternAlt[3];
    if (mess) {
      schedDate = calcDayNameDate(dayName);
      schedDate = new Date(
        schedDate.getFullYear(),
        schedDate.getMonth(),
        schedDate.getDate(),
        hour,
        0
      );
    }
  } else if (textParsed_dayPatternAltAlt) {
    dayName = textParsed_dayPatternAltAlt[1];
    mess = textParsed_dayPatternAltAlt[2];
    if (mess) {
      schedDate = calcDayNameDate(dayName);
      schedDate = new Date(
        schedDate.getFullYear(),
        schedDate.getMonth(),
        schedDate.getDate(),
        12,
        0
      );
    }
  } else if (textParsed_onAtPattern) {
    day = parseInt(textParsed_onAtPattern[1]);
    month = parseInt(textParsed_onAtPattern[3]);
    year = parseInt(textParsed_onAtPattern[5]);
    hour = parseInt(textParsed_onAtPattern[6]);
    minute = parseInt(textParsed_onAtPattern[8]);
    mess = textParsed_onAtPattern[9];
    if (mess) {
      try {
        schedDate = new Date(year, month - 1, day, hour, minute);
      } catch (error) {}
    }
  } else if (textParsed_onAtPatternAlt) {
    day = parseInt(textParsed_onAtPatternAlt[1]);
    month = parseInt(textParsed_onAtPatternAlt[3]);
    hour = parseInt(textParsed_onAtPatternAlt[4]);
    minute = parseInt(textParsed_onAtPatternAlt[6]);
    mess = textParsed_onAtPatternAlt[7];
    if (mess) {
      try {
        schedDate = new Date(
          new Date().getFullYear(),
          month - 1,
          day,
          hour,
          minute
        );
      } catch (error) {}
    }
  } else if (textParsed_onAtPatternAltAlt) {
    day = parseInt(textParsed_onAtPatternAltAlt[1]);
    month = parseInt(textParsed_onAtPatternAltAlt[3]);
    hour = parseInt(textParsed_onAtPatternAltAlt[4]);
    mess = textParsed_onAtPatternAltAlt[5];
    if (mess) {
      try {
        schedDate = new Date(new Date().getFullYear(), month - 1, day, hour, 0);
      } catch (error) {}
    }
  } else if (textParsed_onPattern) {
    day = parseInt(textParsed_onPattern[1]);
    month = parseInt(textParsed_onPattern[3]);
    year = parseInt(textParsed_onPattern[5]);
    mess = textParsed_onPattern[6];
    if (mess) {
      try {
        schedDate = new Date(year, month - 1, day, 12, 0);
      } catch (error) {}
    }
  } else if (textParsed_onPatternAlt) {
    day = parseInt(textParsed_onPatternAlt[1]);
    month = parseInt(textParsed_onPatternAlt[3]);
    mess = textParsed_onPatternAlt[4];
    if (mess) {
      try {
        schedDate = new Date(new Date().getFullYear(), month - 1, day, 12, 0);
      } catch (error) {}
    }
  } else if (textParsed_atPattern) {
    year = new Date().getFullYear();
    month = new Date().getMonth();
    day = new Date().getDate();
    hour = parseInt(textParsed_atPattern[1]);
    minute = parseInt(textParsed_atPattern[3]);
    mess = textParsed_atPattern[4];
    if (mess) {
      try {
        schedDate = new Date(year, month, day, hour, minute);
      } catch (error) {}
    }
  } else if (textParsed_atPatternAlt) {
    year = new Date().getFullYear();
    month = new Date().getMonth();
    day = new Date().getDate();
    hour = parseInt(textParsed_atPatternAlt[1]);
    mess = textParsed_atPatternAlt[2];
    if (mess) {
      try {
        schedDate = new Date(year, month, day, hour, 0);
      } catch (error) {}
    }
  } else if (textParsed_tomorrowPattern) {
    year = new Date().getFullYear();
    month = new Date().getMonth();
    day = new Date().getDate();
    hour = parseInt(textParsed_tomorrowPattern[1]);
    minute = parseInt(textParsed_tomorrowPattern[3]);
    mess = textParsed_tomorrowPattern[4];
    if (mess) {
      try {
        schedDate = new Date(year, month, day, hour, minute);
        schedDate = addDays(schedDate, 1);
      } catch (error) {}
    }
  } else if (textParsed_tomorrowPatternAlt) {
    year = new Date().getFullYear();
    month = new Date().getMonth();
    day = new Date().getDate();
    hour = parseInt(textParsed_tomorrowPatternAlt[1]);
    mess = textParsed_tomorrowPatternAlt[2];
    if (mess) {
      try {
        schedDate = new Date(year, month, day, hour, 0);
        schedDate = addDays(schedDate, 1);
      } catch (error) {}
    }
  } else if (textParsed_tomorrowPatternAltAlt) {
    year = new Date().getFullYear();
    month = new Date().getMonth();
    day = new Date().getDate();
    mess = textParsed_tomorrowPatternAltAlt[1];
    if (mess) {
      try {
        schedDate = new Date(year, month, day, 12, 0);
        schedDate = addDays(schedDate, 1);
      } catch (error) {}
    }
  } else if (textParsed_everyPattern) {
    isEvery = true;
    numTime = parseInt(textParsed_everyPattern[1]);
    strTime = textParsed_everyPattern[2];
    mess = textParsed_everyPattern[3];
  } else if (textParsed_everyPatternAlt) {
    isEvery = true;
    numTime = parseInt(textParsed_everyPatternAlt[1]);
    strTime = textParsed_everyPatternAlt[2];
    switch (strTime) {
      // (s|m|h|d|w|mm|y)
      case 's':
        strTime = 'seconds';
        break;
      case 'm':
        strTime = 'minutes';
        break;
      case 'h':
        strTime = 'hours';
        break;
      case 'd':
        strTime = 'days';
        break;
      case 'w':
        strTime = 'weeks';
        break;
      case 'mm':
        strTime = 'months';
        break;
      case 'y':
        strTime = 'years';
        break;
      default:
        break;
    }
    mess = textParsed_everyPatternAlt[3];
  } else if (textParsed_everyDelayedPattern) {
    isEvery = true;
    isEveryDelayed = true;
    day = parseInt(textParsed_everyDelayedPattern[1]);
    month = parseInt(textParsed_everyDelayedPattern[3]);
    year = parseInt(textParsed_everyDelayedPattern[5]);
    hour = parseInt(textParsed_everyDelayedPattern[6]);
    minute = parseInt(textParsed_everyDelayedPattern[8]);
    numTime = parseInt(textParsed_everyDelayedPattern[9]);
    strTime = textParsed_everyDelayedPattern[10];
    mess = textParsed_everyDelayedPattern[11];
    if (mess) {
      try {
        schedDate = new Date(year, month - 1, day, hour, minute);
      } catch (error) {}
    }
  }

  //-----------------------------------------------------------------------
  if (!mess) {
    ctx.reply('Invalid reminder: empty message!\n/examples');
    return;
  }
  let reminder;
  if (!isEvery) {
    if (!schedDate || schedDate.getTime() < Date.now()) {
      ctx.reply('Invalid reminder: old date!\n/examples');
      return;
    }
    reminder = await scheduleReminder(ctx.session.token, mess, `${schedDate}`);
  } else {
    if (
      (strTime.startsWith('second') && numTime < 1800) ||
      (strTime.startsWith('minute') && numTime < 30)
    ) {
      ctx.reply('Invalid reminder: interval too small!');
      return;
    }
    if (isEvery && !isEveryDelayed) {
      reminder = await intervalReminder(
        ctx.session.token,
        mess,
        `${numTime} ${strTime}`
      );
    } else {
      if (!schedDate || schedDate.getTime() < Date.now()) {
        ctx.reply('Invalid reminder: old date!\n');
        return;
      }
      reminder = await delayedIntervalReminder(
        ctx.session.token,
        mess,
        `${numTime} ${strTime}`,
        schedDate
      );
    }
  }

  ctx.reply(
    `Next run on: ${format(
      reminder.nextRunAt,
      'ddd MMM DD YYYY HH:mm:ss'
    )} (in ${distanceInWordsToNow(reminder.nextRunAt)})`
  );
  return;
};

const calcDayNameDate = dayName => {
  let output;
  let dayFound = false;
  let tomorrow = addDays(new Date(), 1);
  while (!dayFound) {
    switch (dayName) {
      case 'mon':
      case 'monday':
        if (isMonday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      case 'tue':
      case 'tuesday':
        if (isTuesday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      case 'wed':
      case 'wednesday':
        if (isWednesday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      case 'thu':
      case 'thursday':
        if (isThursday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      case 'fri':
      case 'friday':
        if (isFriday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      case 'sat':
      case 'saturday':
        if (isSaturday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      case 'sun':
      case 'sunday':
        if (isSunday(tomorrow)) {
          output = tomorrow;
          dayFound = true;
        } else {
          tomorrow = addDays(tomorrow, 1);
        }
        break;
      default:
        tomorrow = addDays(tomorrow, 1);
        break;
    }
  }
  return output;
};

const calcNextInDate = (numTime, strTime) => {
  let outputDate = new Date();
  switch (strTime) {
    case 's':
    case 'second':
    case 'seconds':
      return addSeconds(outputDate, numTime);
    case 'm':
    case 'minute':
    case 'minutes':
      return addMinutes(outputDate, numTime);
    case 'h':
    case 'hour':
    case 'hours':
      return addHours(outputDate, numTime);
    case 'd':
    case 'day':
    case 'days':
      return addDays(outputDate, numTime);
    case 'mm':
    case 'month':
    case 'months':
      return addMonths(outputDate, numTime);
    case 'y':
    case 'year':
    case 'years':
      return addYears(outputDate, numTime);
    default:
      break;
  }
  return outputDate;
};

const handleSetCronInterval = async ctx => {
  const { text, from } = ctx.message;
  try {
    const interval = parser.parseExpression(text);
    const nextIntervals = [
      interval.next(),
      interval.next(),
      interval.next(),
      interval.next()
    ];
    const dateDiff = Math.round(
      (nextIntervals[3].getTime() - nextIntervals[2].getTime()) / 1000
    );
    if (dateDiff < 1800) {
      // at least the interval more than 1800 seconds (30 minutes)
      ctx.reply('Interval too small!\n/cancel');
      return;
    }
    await updateState(ctx.session.token, `settextinterval$${text}`);
    let res = 'Ok send reminder text.\n\nNext runs will be on:';
    for (let i = 0; i < nextIntervals.length; i++) {
      const cronDate = nextIntervals[i];
      res += `\n${i + 1}) ${format(
        cronDate,
        'ddd MMM DD YYYY HH:mm'
      )} (in ${distanceInWordsToNow(cronDate)})`;
    }
    res += '\n...\n/cancel';
    ctx.reply(res);
  } catch (err) {
    //signale.error(err);
    ctx.reply('Wrong cron!\n/cancel');
  }
};

const handleSetTextInterval = async (ctx, cronInterval) => {
  const { text, from } = ctx.message;
  const reminder = await intervalReminder(
    ctx.session.token,
    text,
    cronInterval
  );
  await updateState(ctx.session.token, 'main');
  ctx.reply(
    `Next run on: ${format(
      reminder.nextRunAt,
      'ddd MMM DD YYYY HH:mm'
    )} (${distanceInWordsToNow(reminder.nextRunAt)})`
  );
};
