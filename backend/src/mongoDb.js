const MongoClient = require('mongodb').MongoClient;

const prod = process.env.NODE_ENV === 'production';

let dbName;
if (prod) {
  dbName = 'agenda_prod';
} else {
  dbName = 'agenda_dev';
}

let mongo = null;

module.exports = getMongoDb = () =>
  new Promise((resolve, reject) => {
    try {
      if (mongo) return resolve(mongo);
      MongoClient.connect(
        process.env.MONGODB_URI,
        { useNewUrlParser: true },
        function(err, client) {
          if (err) return reject(err);
          mongo = client.db(dbName);
          return resolve(mongo);
        }
      );
    } catch (error) {
      return reject(error);
    }
  });
