import { Database } from 'sqlite3'
import { getProcessCommand, startProcess, killPid } from './process-utils'
import fs from 'fs'
import path from 'path'

export default class TunnelManager {
  config: {}
  db: Database

  constructor(configFilePath: string, stateDDBPath: string) {
    try {
      this.config = JSON.parse(fs.readFileSync(path.join(configFilePath), 'utf-8'))
    } catch(err) {
      throw new Error('Invalid config file format')
    }
    
    const db = new Database(stateDDBPath)
    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS state (tunnel VARCHAR(255), pid INT, command VARCHAR(255), target VARCHAR(255), PRIMARY KEY (tunnel))");
    })
    this.db = db
  }

  async getTunnels(): Promise<string[]> {
    return Object.keys(this.config)
  }

  async getTarget(tunnel: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      let database = this.db
      database.get("SELECT command, pid, target FROM state WHERE tunnel = ?", [tunnel], async function (err, row) {
        if (err) {
          throw err;
        }

        if (row) {
          let existingPidCommand = null
          try {
            existingPidCommand = await getProcessCommand(row.pid);
          } catch (err) {
            if (err.message != "Process not found") { throw err }
          }
          if (existingPidCommand == row.command) {
            resolve(row.target)
          } else {
            database.run("DELETE FROM state WHERE tunnel = ?", [tunnel]);
            resolve(null)
          }
        } else {
          resolve(null)
        }
      });
    })
  }

  async setTarget(tunnel: string, target: string | null): Promise<null> {
    const currentTarget = await this.getTarget(tunnel)
    if (currentTarget != target) {

      // Kill current tunnel
      if (currentTarget) {
        this.db.get("SELECT pid FROM state WHERE tunnel = ?", [tunnel], async function (err, row) {
          if (err) { throw new Error('Unexpected sqlite error') }
          await killPid(row.pid)
        });
      }

      // Open to designated target
      if (target) {
        const { bin, args } = spawnArgs(this.config, tunnel, target)
        const { pid, command } = await startProcess(bin, args)
        this.db.serialize(() => {
          this.db.run("INSERT OR REPLACE INTO state (tunnel, pid, command, target) VALUES (?, ?, ?, ?)", [tunnel, pid, command, target]);
        })
        return null
      } else {
        return null
      }
    } else {
      return null
    }
  }

  async wipe(): Promise<null> {
    return new Promise((resolve, reject) => {
      let database = this.db
      database.all("SELECT * FROM state", async function (err, rows) {
        if (err) { throw new Error('Unexpected sqlite error') }
        for (const row of rows) {
          const existingPidCommand = await getProcessCommand(row.pid);
          if (existingPidCommand == row.command) {
            await killPid(row.pid)
          }
        }
        database.run("DELETE FROM state WHERE 1=1")
        resolve(null)
      });
    })
  }

  async close() {
    this.db.close()
  }
}

const spawnArgs = (config: any, tunnel: string, target: string): { bin: string, args: string[] } => {
  if (config[tunnel]) {
    if (config[tunnel][target]) {
      return config[tunnel][target] as { bin: string, args: string[] }
    } else {
      throw new Error('Unknown target for tunnel')
    }
  } else {
    throw new Error('Unknown tunnel')
  }
}