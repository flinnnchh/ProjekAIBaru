import { connectDatabase, disconnectDatabase } from './connection';
import { User } from './models/User';

async function fix() {
  await connectDatabase();
  console.log('🔄 Memperbarui role pengguna...');

  // Set hanya admin@perusahaan.com yang role admin
  await User.updateOne({ email: 'admin@perusahaan.com' }, { $set: { role: 'admin', displayName: 'Administrator' } });
  
  // Set selain admin@perusahaan.com ke role 'user'
  await User.updateMany({ email: { $ne: 'admin@perusahaan.com' } }, { $set: { role: 'user' } });
  await User.updateOne({ email: 'admin1@perusahaan.com' }, { $set: { displayName: 'User 1' } });
  await User.updateOne({ email: 'admin2@perusahaan.com' }, { $set: { displayName: 'User 2' } });

  const allUsers = await User.find({}, 'email displayName role');
  console.log('\n📊 Daftar Akun & Role Terkini:');
  allUsers.forEach((u) => {
    console.log(` - ${u.displayName} (${u.email}) -> Role: [${u.role}]`);
  });

  await disconnectDatabase();
  console.log('\n✅ Sukses diperbarui!');
}

fix().catch(console.error);
