import { Database } from 'sqlite3';

export function getDB(path: string): Database {
  const db = new Database(path + "/state.sqlite3")
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS state (tunnel VARCHAR(255), pid INT, command VARCHAR(255), environment VARCHAR(255))");
  })
  return db;
}