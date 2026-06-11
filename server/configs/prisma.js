import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.),
// neonConfig.poolQueryViaFetch = true
// Type definitions
// declare global {
//var prisma: PrismaClient | undefined
// }

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}
const adapter = new PrismaNeon ({ connectionString });
const prisma = global.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;