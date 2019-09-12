const { hasPermission } = require('../utils');

const Subscription = {
  reminderCompleted: {
    subscribe: async (parent, args, ctx) => {
      if (!ctx.connCtx.user) throw new Error('Not Authenticated!');
      if (!hasPermission(ctx.connCtx.user, ['BOT']))
        throw new Error('Unauthorized!');
      return ctx.pubsub.asyncIterator('reminderCompleted');
    }
  }
};

module.exports = Subscription;
