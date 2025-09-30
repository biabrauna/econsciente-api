const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupOrphans() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB\n');

    const db = client.db();

    // ==========================================
    // 1. Deletar posts órfãos
    // ==========================================
    console.log('📋 [1/3] Cleaning up orphan posts...');
    const postsCollection = db.collection('Posts');
    const usersCollection = db.collection('User');

    const allPosts = await postsCollection.find({}).toArray();
    let deletedPosts = 0;

    for (const post of allPosts) {
      const userExists = await usersCollection.findOne({ _id: post.userId });
      if (!userExists) {
        await postsCollection.deleteOne({ _id: post._id });
        deletedPosts++;
      }
    }

    console.log(`✅ Deleted ${deletedPosts} orphan posts`);

    // ==========================================
    // 2. Deletar ProfilePics órfãos
    // ==========================================
    console.log('\n📋 [2/3] Cleaning up orphan profile pics...');
    const profilePicsCollection = db.collection('ProfilePic');

    const allProfilePics = await profilePicsCollection.find({}).toArray();
    let deletedProfilePics = 0;

    for (const profilePic of allProfilePics) {
      const userExists = await usersCollection.findOne({ _id: profilePic.userId });
      if (!userExists) {
        await profilePicsCollection.deleteOne({ _id: profilePic._id });
        deletedProfilePics++;
      }
    }

    console.log(`✅ Deleted ${deletedProfilePics} orphan profile pics`);

    // ==========================================
    // 3. Deletar DesafiosConcluidos órfãos
    // ==========================================
    console.log('\n📋 [3/3] Cleaning up orphan desafios concluidos...');
    const desafiosConcluidosCollection = db.collection('DesafiosConcluidos');
    const desafiosCollection = db.collection('Desafios');

    const allDesafiosConcluidos = await desafiosConcluidosCollection.find({}).toArray();
    let deletedDesafiosConcluidos = 0;

    for (const desafioConcluido of allDesafiosConcluidos) {
      const userExists = await usersCollection.findOne({ _id: desafioConcluido.userId });
      const desafioExists = await desafiosCollection.findOne({ _id: desafioConcluido.desafioId });

      if (!userExists || !desafioExists) {
        await desafiosConcluidosCollection.deleteOne({ _id: desafioConcluido._id });
        deletedDesafiosConcluidos++;
      }
    }

    console.log(`✅ Deleted ${deletedDesafiosConcluidos} orphan desafios concluidos`);

    // ==========================================
    // 4. Deletar collection Login vazia
    // ==========================================
    console.log('\n📋 [4/4] Removing deprecated Login collection...');
    const collections = await db.listCollections().toArray();
    const loginExists = collections.some(c => c.name === 'Login');

    if (loginExists) {
      await db.collection('Login').drop();
      console.log('✅ Dropped deprecated Login collection');
    } else {
      console.log('ℹ️  Login collection already removed');
    }

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(50));

    const postCount = await postsCollection.countDocuments();
    const profilePicCount = await profilePicsCollection.countDocuments();
    const desafiosConcluidosCount = await desafiosConcluidosCollection.countDocuments();

    console.log(`🗑️  Orphan Posts Deleted: ${deletedPosts}`);
    console.log(`🗑️  Orphan Profile Pics Deleted: ${deletedProfilePics}`);
    console.log(`🗑️  Orphan Desafios Concluidos Deleted: ${deletedDesafiosConcluidos}`);
    console.log(`\n📝 Remaining Posts: ${postCount}`);
    console.log(`🖼️  Remaining Profile Pics: ${profilePicCount}`);
    console.log(`✅ Remaining Desafios Concluidos: ${desafiosConcluidosCount}`);
    console.log('='.repeat(50));
    console.log('\n🎉 CLEANUP COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

cleanupOrphans();
