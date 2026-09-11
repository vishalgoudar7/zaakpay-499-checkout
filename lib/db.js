import mysql from 'mysql2/promise';

let pool;
export function db() {
  if (!pool) pool = mysql.createPool(process.env.DATABASE_URL);
  return pool;
}
