const forge = require('node-forge')
const InternalSocket = require('mitm/lib/internal_socket')
const Socket = require('mitm/lib/socket')

const shimTLS = (originalSocket) => {
  const [shimmedSocketClient, shimmedSocketServer] = InternalSocket.pair()
    .map((handle) => new Socket({ handle }))

  const forgeClient = forge.tls.createConnection({
    server: false,
    verify: (connection, verified, depth, certs) => {
      // TODO: verification
      console.log('[tls] server certificate verified')
      return true
    },
    connected: () => {
      originalSocket.on('data', (data) => {
        forgeClient.prepare(data.toString('binary'))
      })
    },
    tlsDataReady: (connection) => {
      // encrypted data is ready to be sent to the server
      const data = connection.tlsData.getBytes()
      shimmedSocketClient.write(data, 'binary')
    },
    dataReady: (connection) => {
      // clear data from the server is ready
      const data = connection.data.getBytes()
      originalSocket.write(data, 'binary')
    },
    closed: () => {},
    error: console.error
  })

  forgeClient.handshake()

  shimmedSocketClient.on('data', (data) => {
    forgeClient.process(data.toString('binary'))
  })

  return shimmedSocketServer
}


module.exports = { shimTLS }
