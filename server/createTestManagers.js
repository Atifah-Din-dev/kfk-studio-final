// Script to create test manager users for each manager role
const mongoose = require('mongoose');
const { createDefaultManagers } = require('./model/manager');
require('dotenv').config({ path: './config.env' });


async function run() {
  // Use the same connection logic as your backend
  const dbName = 'KFK_STUDIO';
  const connectionString = process.env.ATLAS_URI;
  await mongoose.connect(connectionString, { dbName });
  await createDefaultManagers();
  await mongoose.disconnect();
  console.log('Done.');
}


run().catch(console.error);