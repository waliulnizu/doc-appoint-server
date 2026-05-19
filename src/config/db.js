const { MongoClient, ServerApiVersion } = require("mongodb");

let db;

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
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
  }
};

const getDB = () => {
  return db;
};

module.exports = {
  connectDB,
  getDB,
};