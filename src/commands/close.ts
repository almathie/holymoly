import { Command, flags } from '@oclif/command'
import TunnelManager from '../TunnelManager'

export default class Close extends Command {
  static description = 'close a named tunnel'

  static examples = [
    `$ atm close apptweak
Closes the tunnel named apptweak.
If the tunnel was already closed nothing happens.
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'tunnel', required: true }]

  async run() {
    const { args, flags } = this.parse(Close)

    let mgr: TunnelManager|null = null;
    try {
      mgr = new TunnelManager(this.config.configDir + '/config.json', this.config.cacheDir + '/state.sqlite3')
      await mgr.setTarget(args.tunnel, null)
      this.log('Tunnel closed')
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
