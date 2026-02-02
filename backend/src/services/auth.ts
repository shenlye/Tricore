import type { DB } from "../db";
import { count, eq, or } from "drizzle-orm";
import { sign } from "hono/jwt";
import { users } from "../db/schema";

// Web Crypto API based password hashing (PBKDF2)
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, "0")).join("");

  return `pbkdf2:${ITERATIONS}:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();

  // Support legacy argon2 hashes (always fail for migration purposes)
  if (storedHash.startsWith("$argon2")) {
    return false;
  }

  // Parse PBKDF2 hash
  const parts = storedHash.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return false;
  }

  const [, iterationsStr, saltHex, hashHex] = parts;
  const iterations = Number.parseInt(iterationsStr, 10);
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => Number.parseInt(byte, 16)));
  const expectedHash = new Uint8Array(hashHex.match(/.{2}/g)!.map(byte => Number.parseInt(byte, 16)));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const derivedHash = new Uint8Array(derivedBits);

  // Constant-time comparison
  if (derivedHash.length !== expectedHash.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < derivedHash.length; i++) {
    diff |= derivedHash[i] ^ expectedHash[i];
  }

  return diff === 0;
}

export class AuthService {
  constructor(private db: DB, private jwtSecret: string) {}

  async findUserByIdentifier(identifier: string) {
    const user = await this.db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1);
    return user[0];
  }

  async findUserById(id: number) {
    const user = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user[0];
  }

  async countUsers() {
    const result = await this.db.select({ count: count() }).from(users);
    return result[0].count;
  }

  async createUser(data: typeof users.$inferInsert) {
    const result = await this.db.insert(users).values(data).returning();
    return result[0];
  }

  async verifyPassword(password: string, hash: string) {
    return await verifyPassword(password, hash);
  }

  async hashPassword(password: string) {
    return await hashPassword(password);
  }

  async generateToken(user: { id: number; role: string }) {
    const payload = {
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };
    return await sign(payload, this.jwtSecret);
  }

  async updatePassword(userId: number, newPasswordHash: string) {
    const result = await this.db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, userId))
      .returning();
    return result.length > 0;
  }
}

export { hashPassword, verifyPassword };
