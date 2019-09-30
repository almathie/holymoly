import { Command, flags } from '@oclif/command'
import TunnelManager from '../TunnelManager'

export default class Open extends Command {
  static description = 'open a named tunnel to a named target'

  static examples = [
    `$ atm open apptweak local
Opens the tunnel named apptweak to the target called local.
If the tunnel is already open to the correct target nothing happens.
If the tunnel is open to a different target, the exisitng tunnel is closed before opening the new one
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'tunnel', required: true }, { name: 'target', required: true }]

  async run() {
    const { args, flags } = this.parse(Open)

    let mgr: TunnelManager|null = null;
    try {
      mgr = new TunnelManager(this.config.configDir + '/config.json', this.config.cacheDir + '/state.sqlite3')
      await mgr.setTarget(args.tunnel, args.target)
      this.log('Tunnel opened')
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
