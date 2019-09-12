const session = require('telegraf/session');
const rateLimit = require('telegraf-ratelimit');

const bot = require('./telegraf');
const { startDate } = require('./helpers/util');
const signale = require('./logger');
const { createToken, getUser, createUser } = require('./graphql/graphqlClient');

const limitConfig = {
  window: 500,
  limit: 1
  // onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded')
};

// rate limit
bot.use(rateLimit(limitConfig));

// sessions
bot.use(session());

// reject all old messages
bot.use((ctx, next) => {
  if (!ctx.message) return next();
  if (ctx.message && ctx.message.date > startDate) {
    return next();
  }
});

// get user info
bot.use(async (ctx, next) => {
  let user = await getUser(ctx.from.id.toString());
  if (!user) {
    user = await createUser(ctx.from.id.toString());
  }
  ctx.state = user;
  ctx.session.token = ctx.session.token || createToken(user);
  // if (user.tgid !== process.env.MYTGID) {
  //   signale.warn(`received a msg from a not authorized user: ${ctx.message}`);
  // } else {
  return next();
  // }
});
