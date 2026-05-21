const { MongoClient, ServerApiVersion } = require("mongodb");

let client;
let db;

const connectDB = async () => {
  if (client) {
    return;
  }

  try {
    client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Connected Successfully");

    db = client.db(process.env.DB_NAME);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw error;
  }
};

const closeDB = async () => {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
};

const getDB = () => {
  return db;
};

const getClient = () => {
  if (!client) {
    throw new Error(
      "MongoDB client is not connected. Call connectDB() first."
    );
  }

  return client;
};

module.exports = {
  connectDB,
  closeDB,
  getDB,
  getClient,
};
