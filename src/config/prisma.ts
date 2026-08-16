import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

// Prevent multiple PrismaClient instances during ts-node-dev hot reloads.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

// TEMPORARY DIAGNOSTIC - remove after debugging
import mariadb from "mariadb";
export async function testRawConnection() {
  try {
    const conn = await mariadb.createConnection({
      ...(() => {
        const u = new URL(process.env.DATABASE_URL!.replace("mysql://", "mariadb://"));
        return {
          host: u.hostname,
          port: Number(u.port),
          user: u.username,
          password: u.password,
          database: u.pathname.slice(1),
          ssl: true,
          connectTimeout: 8000,
        };
      })(),
    });
    await conn.end();
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      code: err.code,
      errno: err.errno,
      message: err.message,
      sqlState: err.sqlState,
    };
  }
}