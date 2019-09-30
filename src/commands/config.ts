import { Command, flags } from '@oclif/command'
import TunnelManager from '../TunnelManager'
import { execSync } from 'child_process'

export default class Config extends Command {
  static description = 'open or reload the config file'

  static examples = [
    `$ atm config open
Opens the config file with your default editor.

$ atm config reload
Reloads the config. This closes all currently tracked tunnels
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'operation', required: true }]

  async run() {
    const { args, flags } = this.parse(Config)

    if (args.operation == 'open') {
      try {
        execSync("touch " + this.config.configDir + "/config.json && open " + this.config.configDir + "/config.json")
      } catch (err) {
        this.log(err.message)
      }

    } else {
      const mgr = new TunnelManager(this.config.configDir + '/config.json', this.config.cacheDir + '/state.sqlite3')
      try {
        await mgr.wipe()
      } catch (err) {
        this.log(err.message)
      }
      await mgr.close()

    }
    this.exit(0)
  }
}
