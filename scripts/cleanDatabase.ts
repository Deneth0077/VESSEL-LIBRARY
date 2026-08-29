import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Read .env.local file if available
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  }
} catch (e) {
  // Ignore
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://denethc545_db_user:gCKm52BQXvCkde2D@cluster0.ghh0nv3.mongodb.net/vessels_db?retryWrites=true&w=majority';

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    const db = mongoose.connection.db;

    // Delete all vessels
    const vesselResult = await db.collection('vessels').deleteMany({});
    console.log(`Deleted ${vesselResult.deletedCount} vessel(s).`);

    // Delete all vessel entries
    const entryResult = await db.collection('vesselentries').deleteMany({});
    console.log(`Deleted ${entryResult.deletedCount} vessel entry/entries.`);

    // Delete all audit logs
    const auditResult = await db.collection('auditlogs').deleteMany({});
    console.log(`Deleted ${auditResult.deletedCount} audit log(s).`);

    // Delete all login histories
    const historyResult = await db.collection('loginhistories').deleteMany({});
    console.log(`Deleted ${historyResult.deletedCount} login history record(s).`);

    // Delete all regular non-admin users
    const userResult = await db.collection('users').deleteMany({ role: { $ne: 'ADMIN' } });
    console.log(`Deleted ${userResult.deletedCount} sample non-admin user(s).`);

    // Ensure Admin User exists
    const adminEmployeeId = process.env.ADMIN_EMPLOYEE_ID || 'EMP000';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vessellibrary.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234password!';
    const adminPin = process.env.ADMIN_PIN || '1234';
    const adminFullName = process.env.ADMIN_FULL_NAME || 'Administrator';

    const existingAdmin = await db.collection('users').findOne({ role: 'ADMIN' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const hashedPin = await bcrypt.hash(adminPin, 10);

      await db.collection('users').insertOne({
        fullName: adminFullName,
        employeeId: adminEmployeeId,
        email: adminEmail,
        password: hashedPassword,
        pin: hashedPin,
        role: 'ADMIN',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Admin user created (${adminEmployeeId} / ${adminEmail}).`);
    } else {
      console.log(`Admin user preserved (${existingAdmin.employeeId || existingAdmin.email}).`);
    }

    console.log('\n✅ Database cleanup completed successfully! All sample data removed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();
