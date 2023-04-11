const { hookToTunnel } = require('./index')

const tunnel = process.env.TOW_TUNNEL || 'ws://localhost:8080'

console.info(`Tunnelling TCP connections via ${tunnel}`)

hookToTunnel(tunnel)
