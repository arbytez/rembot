const Extra = require('telegraf/extra');
const { distanceInWordsToNow, format, addMonths } = require('date-fns');

const bot = require('./telegraf');
const { updateState } = require('./graphql/graphqlClient');
const { printReminders } = require('./botCallback');

const helpCmd = () => {
  let output = '';
  output += '/help - print this message\n';
  output += '/examples - print useful examples for the creation of reminders\n';
  output += '/reminders - print all reminders\n';
  output += '/setcroninterval - set a cron interval\n';
  output += '/web - get a valid web session url';
  return output;
};

bot.command('start', async (ctx, next) => {
  ctx.replyWithHTML(
    helpCmd() +
      '\n' +
      `Source code on <a href="https://github.com/arbytez/rembot">github</a>.`
  );
});

bot.command('help', async (ctx, next) => {
  ctx.reply(helpCmd());
});

bot.command('examples', async (ctx, next) => {
  let res = '';
  res += ' - at HH:mm make something\n';
  res += ' - tomorrow make something\n(default time 12:00)\n';
  res += ' - tomorrow at HH:mm make something\n';
  res +=
    ' - in n hours make something\n(seconds|s|minutes|m|hours|h|days|d|weeks|w|months|mm|years|y)\n';
  res += ` - on DD/MM/YYYY at HH:mm make something\n`;
  res +=
    ' - on tuesday at HH:mm make something\n(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\n';
  res += ' - every n hours make something\n';
  res += ' - from DD/MM/YYYY at HH:mm every n days make something';
  ctx.reply(res);
});

bot.command('reminders', async (ctx, next) => {
  await updateState(ctx.session.token, 'main');
  await printReminders(ctx, 1, true);
});

bot.command('setcroninterval', async (ctx, next) => {
  await updateState(ctx.session.token, 'setcroninterval');
  let res = 'Send a cron interval.\n/cancel';
  ctx.reply(res);
});

bot.command('cancel', async (ctx, next) => {
  await handleCancel(ctx);
});

bot.command('web', async (ctx, next) => {
  const { requestUrl } = require('./graphql/graphqlClient');
  const urlInfo = await requestUrl(ctx.session.token);
  let res = `Click <a href="${urlInfo.url}">here</a> to open a web session.`;
  res += `\nUrl valid until: ${format(
    new Date(urlInfo.urlExpiry),
    'ddd MMM DD YYYY HH:mm:ss'
  )} (in ${distanceInWordsToNow(new Date(urlInfo.urlExpiry))})`;
  ctx.replyWithHTML(res);
});

const handleCancel = async ctx => {
  await updateState(ctx.session.token, 'main');
  ctx.reply('Operation cancelled.\n/help');
};
