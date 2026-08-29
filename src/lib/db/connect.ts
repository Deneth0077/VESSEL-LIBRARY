import mongoose from 'mongoose';
import User from '@/models/User';
import Vessel from '@/models/Vessel';
import VesselEntry from '@/models/VesselEntry';
import AuditLog from '@/models/AuditLog';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5s fast timeout
    };

    const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vessels_db';

    cached!.promise = mongoose
      .connect(primaryUri, opts)
      .catch(async (err) => {
        console.warn('Could not connect to MongoDB Atlas cluster (IP whitelist or network issue). Falling back to In-Memory MongoDB:', err.message);
        try {
          // Use eval require to prevent Webpack bundling mongodb-memory-server core
          const { MongoMemoryServer } = eval("require('mongodb-memory-server')");
          const memoryServer = await MongoMemoryServer.create({
            instance: { dbName: 'vessels_db' },
          });
          const memoryUri = memoryServer.getUri();
          console.log('Connected to In-Memory MongoDB:', memoryUri);
          return mongoose.connect(memoryUri, { bufferCommands: false });
        } catch (memErr) {
          console.error('In-memory MongoDB fallback error:', memErr);
          throw new Error('Database connection failed. Please whitelist your IP address in MongoDB Atlas (0.0.0.0/0).');
        }
      })
      .then(async (m) => {
        await seedDefaultAdmin(m);
        return m;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

/**
 * Seed default Admin (EMP000) and initial demo data if database is empty
 */
async function seedDefaultAdmin(m: typeof mongoose) {
  try {
    const adminEmpId = 'EMP000';
    let admin = await User.findOne({ employeeId: adminEmpId });

    if (!admin) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash('1234', salt);

      admin = await User.create({
        fullName: 'System Administrator',
        employeeId: adminEmpId,
        email: 'admin@vessellibrary.com',
        pinHash,
        role: 'ADMIN',
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'SYSTEM_INIT',
      });
      console.log('Default Admin Account EMP000 / PIN 1234 created.');

      // Sample User EMP001
      const user1 = await User.create({
        fullName: 'John Perera',
        employeeId: 'EMP001',
        email: 'john.perera@vessellibrary.com',
        pinHash,
        role: 'USER',
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminEmpId,
      });

      // Sample Vessel 1: MV OCEAN STAR
      const v1 = await Vessel.create({
        vesselName: 'MV OCEAN STAR',
        imoNumber: '9876543',
        vesselType: 'Bulk Carrier',
        flag: 'Panama',
        ownerOperator: 'Global Maritime Holdings Ltd.',
        callSign: '3F2B',
        yearBuilt: 2018,
        basicInformation:
          'Deadweight Tonnage: 58,000 DWT. Overall Length: 199.9m. Main Engine: MAN B&W 6S50ME-B9. Equipped with 4x 30-tonne deck cranes for cargo operations.',
        mainPhotographs: [
          {
            url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop',
            filename: 'ocean_star_port.jpg',
            uploadedBy: adminEmpId,
            uploadedByName: 'System Administrator',
            uploadedAt: new Date(),
            caption: 'Port side view during harbor loading',
          },
        ],
        createdBy: admin._id.toString(),
        updatedBy: admin._id.toString(),
      });

      // Sample Vessel 2: OCEANIC PIONEER
      await Vessel.create({
        vesselName: 'OCEANIC PIONEER',
        imoNumber: '9123456',
        vesselType: 'Container Ship',
        flag: 'Marshall Islands',
        ownerOperator: 'Pacific Trans Line Inc.',
        callSign: 'V7AB9',
        yearBuilt: 2021,
        basicInformation:
          'Capacity: 4,500 TEU. Service Speed: 21.5 knots. Equipped with 500 reefer plugs and dual ballast water treatment plant.',
        mainPhotographs: [
          {
            url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
            filename: 'oceanic_pioneer_deck.jpg',
            uploadedBy: adminEmpId,
            uploadedByName: 'System Administrator',
            uploadedAt: new Date(),
            caption: 'Container deck configuration',
          },
        ],
        createdBy: admin._id.toString(),
        updatedBy: admin._id.toString(),
      });

      // Sample Entries
      await VesselEntry.create({
        vesselId: v1._id,
        section: 'STRUCTURAL_DAMAGE',
        text: 'Minor indentation observed on starboard side hull plating, frame 142. Approximately 40cm in diameter, maximum depth 15mm. No cracking or coating failure visible. Requires monitoring during next dry dock.',
        photographs: [
          {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
            filename: 'hull_plating_indent.jpg',
            uploadedBy: 'EMP001',
            uploadedByName: 'John Perera',
            uploadedAt: new Date(),
            caption: 'Starboard hull plating frame 142',
          },
        ],
        createdBy: user1._id.toString(),
        createdByName: 'John Perera',
        updatedBy: user1._id.toString(),
        updatedByName: 'John Perera',
      });

      await VesselEntry.create({
        vesselId: v1._id,
        section: 'OPERATIONAL_CHALLENGE',
        text: 'Cargo hold #2 hatch cover hydraulic cylinder seal showing minor seepage under high operational pressure. Replacement seals requested from technical store.',
        photographs: [],
        createdBy: user1._id.toString(),
        createdByName: 'John Perera',
        updatedBy: user1._id.toString(),
        updatedByName: 'John Perera',
      });

      await AuditLog.create({
        userId: admin._id.toString(),
        userName: admin.fullName,
        userRole: 'ADMIN',
        action: 'AUTO_INITIAL_SEED',
        target: 'ALL',
        timestamp: new Date(),
      });
    }
  } catch (err) {
    console.error('Error auto-seeding default data:', err);
  }
}

export default dbConnect;
