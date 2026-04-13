import { spawn, type ChildProcess } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const childProcesses: ChildProcess[] = [
  spawn(process.execPath, ['--watch', '--experimental-strip-types', 'server/index.ts'], {
    stdio: 'inherit',
  }),
  spawn(npmCommand, ['run', 'dev:client'], {
    stdio: 'inherit',
  }),
]

function shutdown(signal: NodeJS.Signals): void {
  for (const childProcess of childProcesses) {
    if (!childProcess.killed) {
      childProcess.kill(signal)
    }
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    shutdown(signal)
    process.exit(0)
  })
}

for (const childProcess of childProcesses) {
  childProcess.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown('SIGTERM')
      process.exit(code)
    }
  })
}
