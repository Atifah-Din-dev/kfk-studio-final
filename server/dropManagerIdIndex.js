// Script to drop the unique index on manager_id in the managers collection
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/config.env' });


async function dropIndex() {
  const dbName = 'KFK_STUDIO';
  const connectionString = process.env.ATLAS_URI;
  await mongoose.connect(connectionString, { dbName });
  try {
    await mongoose.connection.collection('managers').dropIndex('manager_id_1');
    console.log('Dropped index: manager_id_1');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index manager_id_1 does not exist.');
    } else {
      console.error('Error dropping index:', err);
    }
  }
  await mongoose.disconnect();
}


dropIndex().catch(console.error);