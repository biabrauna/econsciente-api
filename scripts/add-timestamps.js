const { MongoClient } = require('mongodb');
require('dotenv').config();

async function addTimestamps() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const now = new Date();

    // Collections to update
    const collections = [
      'User',
      'Desafios',
      'DesafiosConcluidos',
      'Posts',
      'ProfilePic'
    ];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);

      // Find documents without createdAt
      const docsWithoutTimestamps = await collection.find({
        $or: [
          { createdAt: { $exists: false } },
          { createdAt: null }
        ]
      }).toArray();

      console.log(`\n${collectionName}: Found ${docsWithoutTimestamps.length} documents without timestamps`);

      if (docsWithoutTimestamps.length > 0) {
        // Update all documents without timestamps
        const result = await collection.updateMany(
          {
            $or: [
              { createdAt: { $exists: false } },
              { createdAt: null }
            ]
          },
          {
            $set: {
              createdAt: now,
              updatedAt: now
            }
          }
        );

        console.log(`${collectionName}: Updated ${result.modifiedCount} documents`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

addTimestamps();
