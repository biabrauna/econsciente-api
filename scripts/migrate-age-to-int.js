const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateAgeToInt() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('User');

    // Find all users with age as string
    const users = await usersCollection.find({ age: { $type: 'string' } }).toArray();
    console.log(`Found ${users.length} users with age as string`);

    // Update each user
    for (const user of users) {
      const ageInt = parseInt(user.age, 10);

      if (isNaN(ageInt)) {
        console.warn(`Warning: User ${user._id} has invalid age: ${user.age}. Setting to 18.`);
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { age: 18 } }
        );
      } else {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { age: ageInt } }
        );
        console.log(`Updated user ${user._id}: "${user.age}" -> ${ageInt}`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrateAgeToInt();
