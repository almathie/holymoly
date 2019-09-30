import { Command, flags } from '@oclif/command'
import TunnelManager from '../TunnelManager'
import Table from 'easy-table'

export default class Status extends Command {
  static description = 'print a status of all tunnels tracked by ATM'

  static examples = [
    `$ atm status
Prints a status of all tunnels tracked by ATM.
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    
    let mgr: TunnelManager|null = null;
    try {
      mgr = new TunnelManager(this.config.configDir + '/config.json', this.config.cacheDir + '/state.sqlite3')
      
      const table = new Table
      const tunnels = await mgr.getTunnels()
      let i = 0
      for (const tunnel of tunnels) {
        i = i + 1
        const target = await mgr.getTarget(tunnel)
        table.cell('ID', i)
        table.cell('Tunnel', tunnel)
        if (target) {
          table.cell('Target', target)
        } else {
          table.cell('Target', 'CLOSED')
        }

        table.newRow()
      }
      this.log(table.toString())

    } catch (err) {
      this.log(err.message)
    } finally {
      if(mgr){
        await mgr.close()
      }
      this.exit(0)
    }
  }
}
