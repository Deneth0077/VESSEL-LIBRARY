const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://denethc545_db_user:gCKm52BQXvCkde2D@cluster0.ghh0nv3.mongodb.net/vessels_db?retryWrites=true&w=majority';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const users = await mongoose.connection.collection('users').find({}).toArray();

  const candidates = new Set();
  // Years
  for (let y = 1970; y <= 2026; y++) candidates.add(y.toString());
  // Digits & patterns
  for (let d = 0; d <= 9; d++) {
    candidates.add('' + d + d + d + d);
    for (let d2 = 0; d2 <= 9; d2++) {
      candidates.add('' + d + d2 + d + d2);
      candidates.add('' + d + d + d2 + d2);
      candidates.add('0' + d + d2);
      candidates.add('00' + d);
    }
  }
  // Sequences
  ['1234', '4321', '0123', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '1357', '2468', '2580', '0852', '1122', '3344', '5566', '7788', '9900'].forEach(p => candidates.add(p));

  // Date/Month
  for (let m = 1; m <= 12; m++) {
    for (let day = 1; day <= 31; day++) {
      const mm = m < 10 ? '0' + m : '' + m;
      const dd = day < 10 ? '0' + day : '' + day;
      candidates.add(dd + mm);
      candidates.add(mm + dd);
    }
  }

  const candList = Array.from(candidates);
  console.log(`Checking ${candList.length} candidate PINs for ${users.length} users...`);

  for (const u of users) {
    let pin = null;
    for (const c of candList) {
      if (bcrypt.compareSync(c, u.pinHash)) {
        pin = c;
        break;
      }
    }
    console.log(`EMPLOYEE_ID: "${u.employeeId}" | NAME: "${u.fullName}" | EMAIL: "${u.email}" | ROLE: "${u.role}" | PIN: "${pin || 'Custom PIN'}"`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

