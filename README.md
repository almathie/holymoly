HolyMoly Tunnel Manager
=======================

HolyMoly helps developer manage their SSH Tunnels

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/holymoly.svg)](https://npmjs.org/package/holymoly)
[![Downloads/week](https://img.shields.io/npm/dw/holymoly.svg)](https://npmjs.org/package/holymoly)
[![License](https://img.shields.io/npm/l/holymoly.svg)](https://github.com/almathie/holymoly/blob/master/package.json)

<!-- toc -->
* [Description](#description)
* [Usage](#usage)
* [Configuration](#configuration)
<!-- tocstop -->

# Description
This is a cli tunnel manager. HolyMoly allows you to define ssh tunnels in a config file then open/close them using simple commands. Each tunnel is defined by a name and one or multiple targets. Each tunnel can be opened to a single target at a time.

# Motivation
When working with multiple developement / test environments it can be cumbersome to relaunch each microservice with a different configuration when targeting a different environment. One solution is to setup your microservice with a single static sharable configuration that targets SSH tunnels. The output of each tunnel defines which environement is used by the microservice.

# Usage
```sh-session
$ npm install -g holymoly

$ holymoly open config
Opens the config file where you need to define your tunnels. For an example, see below.

$ holymoly status
ID  Tunnel               Target
--  -------------------  ------
1   tunnel-1             CLOSED
2   tunnel-2             CLOSED

$ holymoly open tunnel-1 local
Tunnel opened

$ holymoly open tunnel-2 staging
Tunnel opened

$ holymoly status
ID  Tunnel               Target
--  -------------------  ------
1   tunnel-1             local
2   tunnel-2             staging

$ holymoly close tunnel-1
Tunnel closed

$ holymoly status
ID  Tunnel               Target
--  -------------------  ------
1   tunnel-1             CLOSED
2   tunnel-2             staging
```

# Configuration
<!-- configration -->
The confirguration file is located in `~/.config/holymoly/config.json`

Here is a sample config file that defines two tunnels named `tunnel-1` and `tunnel-2` with two possible targets named `local` and `staging`

```
{
  "tunnel-1": {
    "local": {
      "bin": "socat",
      "args": ["tcp-listen:7000,reuseaddr,fork", "tcp:localhost:3306"]
    },
    "staging": {
      "bin": "ssh",
      "args": ["-N", "-L", "7000:your-aurora.cluster-abcdef.eu-west-1.rds.amazonaws.com:3306", "username@bastion.com"]
    }
  },
  "tunnel-2": {
    "local": {
      "bin": "socat",
      "args": ["tcp-listen:7001,reuseaddr,fork", "tcp:localhost:27017"]
    },
    "staging": {
      "bin": "ssh",
      "args": ["-N", "-L", "7001:37.87.56.24:27017", "username@bastion.com"]
    }
  }
}
```
<!-- configrationstop -->