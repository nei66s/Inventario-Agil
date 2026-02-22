const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')

function log(message) {
  process.stdout.write(`[clean-build] ${message}\n`)
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function parseDistDirFromNextConfig(projectRoot) {
  const configPath = path.join(projectRoot, 'next.config.ts')
  if (!fs.existsSync(configPath)) {
    return '.next'
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8')
    const match = content.match(/distDir\s*:\s*['"`]([^'"`]+)['"`]/)
    return match?.[1] ?? '.next'
  } catch {
    return '.next'
  }
}

function getNodeProcesses() {
  if (process.platform === 'win32') {
    try {
      const raw = execSync(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq \'node.exe\' } | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      )
      if (!raw.trim()) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return []
    }
  }

  try {
    const raw = execSync('ps -ax -o pid=,command=', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const firstSpace = line.indexOf(' ')
        if (firstSpace < 0) return null
        return {
          ProcessId: Number(line.slice(0, firstSpace).trim()),
          CommandLine: line.slice(firstSpace + 1).trim(),
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function isBuildProcess(commandLine) {
  const cmd = String(commandLine || '').toLowerCase()
  return (
    cmd.includes('next') &&
    cmd.includes(' build') &&
    (cmd.includes('next\\dist\\bin\\next') || cmd.includes('next/dist/bin/next') || cmd.includes('npm-cli.js') || cmd.includes('npm run build'))
  )
}

function killBuildProcesses() {
  const currentPid = process.pid
  const processes = getNodeProcesses()
  const targets = processes.filter((proc) => {
    const pid = Number(proc.ProcessId)
    if (!Number.isFinite(pid) || pid <= 0 || pid === currentPid) return false
    if (String(proc.CommandLine || '').includes('clean-build.js')) return false
    return isBuildProcess(proc.CommandLine)
  })

  for (const proc of targets) {
    const pid = Number(proc.ProcessId)
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: ['ignore', 'ignore', 'ignore'] })
      } else {
        process.kill(pid, 'SIGKILL')
      }
      log(`Killed orphan build process PID=${pid}`)
    } catch {
      log(`Could not kill PID=${pid} (already exited or no permission)`)
    }
  }
}

function removeDirIfExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return
  }
  fs.rmSync(dirPath, { recursive: true, force: true })
  log(`Removed ${path.relative(process.cwd(), dirPath) || dirPath}`)
}

function cleanBuildArtifacts(projectRoot) {
  const distDir = parseDistDirFromNextConfig(projectRoot)
  const candidates = new Set(['.next', distDir].filter(Boolean))

  for (const dir of candidates) {
    const absolutePath = path.isAbsolute(dir) ? dir : path.join(projectRoot, dir)
    removeDirIfExists(absolutePath)
  }
}

function runBuild() {
  const npmCmd = getNpmCommand()
  const result = spawnSync(npmCmd, ['run', 'build'], {
    stdio: 'inherit',
  })
  process.exit(result.status ?? 1)
}

function main() {
  const projectRoot = process.cwd()
  log('Killing orphan build processes...')
  killBuildProcesses()
  log('Cleaning build artifacts...')
  cleanBuildArtifacts(projectRoot)
  log('Running npm run build...')
  runBuild()
}

main()
