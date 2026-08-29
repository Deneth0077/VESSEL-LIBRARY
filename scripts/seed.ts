import { dbConnect } from '../src/lib/db/connect';

async function main() {
  console.log('Connecting to database via dbConnect()...');
  const conn = await dbConnect();
  console.log('Database connected and initialized successfully!');
  await conn.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
