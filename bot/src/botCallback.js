const { distanceInWordsToNow, format } = require('date-fns');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');

const bot = require('./telegraf');
const { shortenText } = require('./helpers/util');
const {
  getReminders,
  scheduleReminder,
  countReminders,
  getReminder,
  enableReminder,
  disableReminder,
  removeReminder
} = require('./graphql/graphqlClient');

bot.use(async (ctx, next) => {
  if (ctx.callbackQuery) {
    const [action, key, key2, key3] = ctx.callbackQuery.data.split('$');
    switch (action) {
      case 'selectreminder':
        await selectReminder(ctx, key, key2);
        break;
      case 'reminderPage':
        if (parseInt(key) !== parseInt(key2)) {
          await printReminders(ctx, parseInt(key2), false);
        }
        break;
      case 'reminderAction':
        await reminderAction(ctx, key, key2, key3);
        break;
      default:
        break;
    }
  }
  return next();
});

const reminderAction = async (ctx, action, reminderId, fromPage) => {
  let result;
  switch (action) {
    case 'enable':
      result = await enableReminder(ctx.session.token, reminderId);
      if (result) await printReminders(ctx, fromPage);
      break;
    case 'disable':
      result = await disableReminder(ctx.session.token, reminderId);
      if (result) await printReminders(ctx, fromPage);
      break;
    case 'remove':
      result = await removeReminder(ctx.session.token, reminderId);
      if (result) await printReminders(ctx, fromPage);
      break;
    case 'create':
      await createReminder(ctx, reminderId, fromPage);
      break;
    default:
      break;
  }
};

const createReminder = async (ctx, reminderId, when) => {
  const oldReminder = await getReminder(ctx.session.token, reminderId);
  if (oldReminder) {
    const reminder = await scheduleReminder(
      ctx.session.token,
      oldReminder.text,
      when
    );
    ctx.editMessageText(
      `Reminder postponed on: ${format(
        reminder.nextRunAt,
        'ddd MMM DD YYYY HH:mm:ss'
      )} (in ${distanceInWordsToNow(reminder.nextRunAt)})`
    );
  }
};

const selectReminder = async (ctx, reminderId, fromPage) => {
  let res = '';
  const reminder = await getReminder(ctx.session.token, reminderId);
  res += getReminderData(reminder);
  let inlineButtons = [];
  let actionsInlineButtons = [];
  let menuInlineButtons = [];
  if (reminder.disabled) {
    actionsInlineButtons.push(
      Markup.callbackButton(
        'Enable',
        `reminderAction$enable$${reminderId}$${fromPage}`
      )
    );
  } else {
    actionsInlineButtons.push(
      Markup.callbackButton(
        'Disable',
        `reminderAction$disable$${reminderId}$${fromPage}`
      )
    );
  }
  actionsInlineButtons.push(
    Markup.callbackButton(
      'Remove',
      `reminderAction$remove$${reminderId}$${fromPage}`
    )
  );
  menuInlineButtons.push(
    Markup.callbackButton('Return', `reminderPage$${-999}$${fromPage}`)
  );
  inlineButtons.push(actionsInlineButtons, menuInlineButtons);
  const keyboard = Markup.inlineKeyboard(inlineButtons);
  ctx.editMessageText(res, Extra.markup(keyboard));
};

const getReminderData = reminder => {
  return `${shortenText(reminder.text)} ${
    reminder.disabled ? '(disabled) ' : ''
  }(${format(
    reminder.nextRunAt,
    'ddd MMM DD YYYY HH:mm:ss'
  )}, in ${distanceInWordsToNow(reminder.nextRunAt)})`;
};

const printReminders = async (ctx, pageNumber, init = true) => {
  const initialPageNumber = pageNumber;
  const counter = await countReminders(ctx.session.token);
  const nPerPage = parseInt(process.env.REM_PER_PAGE);
  const totalPages = Math.ceil(counter / nPerPage);
  if (pageNumber <= 0 || pageNumber > totalPages) pageNumber = 1;
  const skip = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
  const reminders = await getReminders(ctx.session.token, skip, nPerPage);
  let inlineButtons = [];
  let remInlineButtons = [];
  let menuInlineButtons = [];
  let res = `You have ${counter} reminder${counter > 1 ? 's' : ''}${
    totalPages > 0 ? ` (page: ${pageNumber}/${totalPages})` : ''
  }${counter === 0 ? '.' : ':'}`;
  for (let i = 0; i < reminders.length; i++) {
    const reminder = reminders[i];
    res += `\n${skip + i + 1}) ${getReminderData(reminder)}`;
    remInlineButtons.push(
      Markup.callbackButton(
        `${skip + i + 1}`,
        `selectreminder$${reminder.id}$${pageNumber}`
      )
    );
  }
  if (counter > 0) {
    menuInlineButtons.push(
      Markup.callbackButton('<<', `reminderPage$${initialPageNumber}$${1}`),
      Markup.callbackButton(
        '<',
        `reminderPage$${initialPageNumber}$${
          pageNumber - 1 < 1 ? 1 : pageNumber - 1
        }`
      ),
      Markup.callbackButton(
        '>',
        `reminderPage$${initialPageNumber}$${
          pageNumber + 1 > totalPages ? totalPages : pageNumber + 1
        }`
      ),
      Markup.callbackButton(
        '>>',
        `reminderPage$${initialPageNumber}$${totalPages}`
      )
    );
  }
  inlineButtons.push(remInlineButtons, menuInlineButtons);
  const keyboard = Markup.inlineKeyboard(inlineButtons);
  if (init) {
    ctx.reply(res, Extra.markup(keyboard));
  } else {
    ctx.editMessageText(res, Extra.markup(keyboard));
  }
};

exports.printReminders = printReminders;
