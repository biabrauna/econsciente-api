const { MongoClient } = require('mongodb');
require('dotenv').config();

async function completeMigration() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB\n');

    const db = client.db();
    const now = new Date();

    // ==========================================
    // 1. Verificar e adicionar campos default nos Users
    // ==========================================
    console.log('📋 [1/5] Checking User defaults...');
    const usersCollection = db.collection('User');

    const usersNeedingDefaults = await usersCollection.find({
      $or: [
        { pontos: { $exists: false } },
        { pontos: null },
        { seguidores: { $exists: false } },
        { seguidores: null },
        { seguindo: { $exists: false } },
        { seguindo: null }
      ]
    }).toArray();

    if (usersNeedingDefaults.length > 0) {
      for (const user of usersNeedingDefaults) {
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              pontos: user.pontos ?? 0,
              seguidores: user.seguidores ?? 0,
              seguindo: user.seguindo ?? 0,
            }
          }
        );
      }
      console.log(`✅ Updated ${usersNeedingDefaults.length} users with default values`);
    } else {
      console.log('✅ All users have default values');
    }

    // ==========================================
    // 2. Verificar e adicionar defaults em Posts
    // ==========================================
    console.log('\n📋 [2/5] Checking Posts defaults...');
    const postsCollection = db.collection('Posts');

    const postsNeedingDefaults = await postsCollection.find({
      $or: [
        { likes: { $exists: false } },
        { likes: null }
      ]
    }).toArray();

    if (postsNeedingDefaults.length > 0) {
      await postsCollection.updateMany(
        {
          $or: [
            { likes: { $exists: false } },
            { likes: null }
          ]
        },
        {
          $set: { likes: 0 }
        }
      );
      console.log(`✅ Updated ${postsNeedingDefaults.length} posts with default likes`);
    } else {
      console.log('✅ All posts have default likes');
    }

    // ==========================================
    // 3. Remover model Login se existir
    // ==========================================
    console.log('\n📋 [3/5] Checking for deprecated Login collection...');
    const collections = await db.listCollections().toArray();
    const loginExists = collections.some(c => c.name === 'Login');

    if (loginExists) {
      const loginCount = await db.collection('Login').countDocuments();
      console.log(`⚠️  Found deprecated Login collection with ${loginCount} documents`);
      console.log('   This collection is no longer used (replaced by User model)');
      // Não deletamos automaticamente para segurança
      // await db.collection('Login').drop();
      // console.log('✅ Dropped Login collection');
    } else {
      console.log('✅ No deprecated Login collection found');
    }

    // ==========================================
    // 4. Verificar integridade de relacionamentos
    // ==========================================
    console.log('\n📋 [4/5] Checking relationship integrity...');

    // Posts sem usuário válido
    const allPosts = await postsCollection.find({}).toArray();
    let orphanPosts = 0;

    for (const post of allPosts) {
      const userExists = await usersCollection.findOne({ _id: post.userId });
      if (!userExists) {
        orphanPosts++;
        console.log(`⚠️  Post ${post._id} has invalid userId: ${post.userId}`);
      }
    }

    if (orphanPosts === 0) {
      console.log('✅ All posts have valid user references');
    } else {
      console.log(`⚠️  Found ${orphanPosts} orphan posts (consider cleanup)`);
    }

    // ProfilePic duplicados
    const profilePicsCollection = db.collection('ProfilePic');
    const duplicateProfiles = await profilePicsCollection.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateProfiles.length > 0) {
      console.log(`⚠️  Found ${duplicateProfiles.length} users with multiple profile pics`);
      for (const dup of duplicateProfiles) {
        const profiles = await profilePicsCollection.find({ userId: dup._id }).sort({ createdAt: -1 }).toArray();
        // Manter apenas o mais recente
        const toDelete = profiles.slice(1);
        for (const profile of toDelete) {
          await profilePicsCollection.deleteOne({ _id: profile._id });
        }
        console.log(`   Cleaned up ${toDelete.length} duplicate profile pics for user ${dup._id}`);
      }
      console.log('✅ Removed duplicate profile pics');
    } else {
      console.log('✅ No duplicate profile pics found');
    }

    // ==========================================
    // 5. Criar índices se não existirem
    // ==========================================
    console.log('\n📋 [5/5] Ensuring database indexes...');

    // User indexes
    const userIndexes = await usersCollection.indexes();
    const hasEmailIndex = userIndexes.some(idx => idx.key.email);
    if (!hasEmailIndex) {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created email index on Users');
    }

    // Posts indexes
    await postsCollection.createIndex({ userId: 1 });
    await postsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created indexes on Posts');

    // Desafios indexes
    const desafiosCollection = db.collection('Desafios');
    await desafiosCollection.createIndex({ desafios: 'text' });
    console.log('✅ Created text search index on Desafios');

    // DesafiosConcluidos indexes
    const desafiosConcluidosCollection = db.collection('DesafiosConcluidos');
    await desafiosConcluidosCollection.createIndex({ userId: 1 });
    await desafiosConcluidosCollection.createIndex({ desafioId: 1 });
    await desafiosConcluidosCollection.createIndex({ userId: 1, desafioId: 1 });
    console.log('✅ Created indexes on DesafiosConcluidos');

    // ProfilePic indexes
    await profilePicsCollection.createIndex({ userId: 1 }, { unique: true });
    console.log('✅ Created unique index on ProfilePic');

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));

    const userCount = await usersCollection.countDocuments();
    const postCount = await postsCollection.countDocuments();
    const desafiosCount = await desafiosCollection.countDocuments();
    const profilePicCount = await profilePicsCollection.countDocuments();
    const desafiosConcluidosCount = await desafiosConcluidosCollection.countDocuments();

    console.log(`👥 Users: ${userCount}`);
    console.log(`📝 Posts: ${postCount}`);
    console.log(`🎯 Desafios: ${desafiosCount}`);
    console.log(`🖼️  Profile Pics: ${profilePicCount}`);
    console.log(`✅ Desafios Concluídos: ${desafiosConcluidosCount}`);
    console.log('='.repeat(50));
    console.log('\n🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

completeMigration();
