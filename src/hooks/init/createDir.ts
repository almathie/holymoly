import {Hook} from '@oclif/config'

import fs from 'fs'

const hook: Hook<'init'> = async function (opts) {
  if (!fs.existsSync(this.config.configDir)){
    fs.mkdirSync(this.config.configDir, { recursive: true });
  }

  if (!fs.existsSync(this.config.cacheDir)){
    fs.mkdirSync(this.config.cacheDir, { recursive: true });
  }
}

export default hook
