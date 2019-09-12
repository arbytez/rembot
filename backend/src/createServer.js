const jwt = require('jsonwebtoken');
const { ApolloServer, makeExecutableSchema } = require('apollo-server-express');
const { importSchema } = require('graphql-import');

const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const Subscription = require('./resolvers/Subscription');
const pubsub = require('./pubsub');
const prismaDb = require('./prismaDb');
const getMongoDb = require('./mongoDb');
const getAgenda = require('./agenda');
const signale = require('./logger');

const schema = makeExecutableSchema({
  typeDefs: importSchema('src/schema.graphql'),
  resolvers: {
    Mutation,
    Query,
    Subscription
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

// start agenda
getAgenda()
  .then(agenda => {
    agenda.start();
  })
  .catch(err => {
    signale.error(err);
  });

function createServer() {
  return new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      const mongoDb = await getMongoDb();
      const agenda = await getAgenda();
      if (connection) {
        const connCtx = connection.context;
        return { ...req, prismaDb, mongoDb, agenda, pubsub, connCtx };
      }
      return { ...req, prismaDb, mongoDb, agenda, pubsub };
    },
    subscriptions: {
      onConnect: async (connectionParams, webSocket) => {
        const { authorization } = connectionParams.headers;
        if (authorization) {
          try {
            const user = jwt.verify(authorization, process.env.JWT_SECRET);
            if (user) return { user };
          } catch (error) {}
        }
      }
    }
  });
}

module.exports = createServer;
