import find from 'find-process'
import { execSync, spawn } from 'child_process'

const killPid = async (pid: number): Promise<void> => {
  //console.log('KILLing PID '+pid)
  execSync("kill -9 " + pid)
}

const getProcessCommand = async (pid: number): Promise<string> => {
  //console.log('GETing command from PID '+pid)
  const childProcs = await find('pid', pid, true)
  const childProc = childProcs[0]
  if (childProc) {
    return childProc.cmd
  } else {
    throw new Error('Process not found')
  }
}

const startProcess = async (bin: string, args: string[]): Promise<{ pid: number, command: string }> => {
  //console.log('Starting a process')
  let child = spawn(bin, args, { detached: true })
  //this.log(child)
  //child.disconnect()
  const childProcs = await find('pid', child.pid, true)
  const childProc = childProcs[0]
  if (childProc) {
    return {
      pid: childProc.pid,
      command: childProc.cmd
    }
  } else {
    throw new Error("Process failed to start")
  }
}

export { killPid, getProcessCommand, startProcess }