const Mitm = require('mitm')
const { tunnelTo } = require('tcp-over-websockets/tunnel')
const { shimTLS } = require('./lib/shim-tls')

const hookToTunnel = (tunnel) => {
  const mitm = Mitm()
  const tunnelOnConnection = (socket, options) => {
    const destinationHostPort = options.socket
      ? `${options.servername || options.socket.remoteAddress}:${options.socket.remotePort}`
      : `${options.servername || options.host}:${options.port}`

    tunnelTo(tunnel, destinationHostPort)(socket.encrypted ? shimTLS(socket) : socket)
  }
  const bypassIfTunnel = (socket, options) => {
    const destinationHostPort = `${options.host}:${options.port}`
    if (
      tunnel.endsWith(destinationHostPort) ||
      (tunnel.endsWith(options.host) && [443, 80].includes(options.port))
    ) {
      socket.bypass()
    }
  }
  // If a connection is about to be made to the tunnelling service,
  // let the connection be made and do not intercept
  mitm.on('connect', bypassIfTunnel)
  // Intercept all other connections to tunnel through WebSockets
  mitm.on('connection', tunnelOnConnection)
}

module.exports = { hookToTunnel }
