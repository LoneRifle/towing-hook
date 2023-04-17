const { hookToTunnel } = require('./index')

const tunnel = process.env.TOW_TUNNEL || 'wss://towing-service.fly.dev'

console.info(`Tunnelling TCP connections via ${tunnel}`)

hookToTunnel(tunnel)
