# towing-hook

Route your Node.js application's TCP connectivity through WebSockets. 
Built on [tcp-over-websockets](https://github.com/derhuerst/tcp-over-websockets).

Useful for scenarios where you are unable to make socket connections, eg:

- You are behind a corporate firewall that only allows outbound http(s) traffic

- If you are using [stackblitz](https://stackblitz.com/), which runs Node.js 
  completely within the browser, and hence does not support socket connections

## Quickstart

### Preparation

Host a tcp-over-websockets tunnel service. This will accept your 
websocket connection and make a socket connection on your behalf:

```sh
$ DEBUG=tcp-over-websockets:* npx -p tcp-over-websockets tcp-over-websockets-server
listening on 8080
```

### As a module hook

```sh
# Set an optional env var to point to the websocket gateway
# Defaults to ws://localhost:8080
$ export TOW_TUNNEL=ws://localhost:8080

# You may wish to enable debug logging for the underlying
# tcp-over-websockets dependency by setting this env var
$ export DEBUG=tcp-over-websockets:*

# Use towing-hook without modifying your application
$ node -r towing-hook/register your-application.js

```

### Programmatic use

```js
const { hookToTunnel } = require('towing-hook')

hookToTunnel('ws://localhost:8080')

// Connections are now routed through websockets

```

## How it works

This package glues two dependencies together, 
[mitm.js](https://github.com/moll/node-mitm) and 
[tcp-over-websockets](https://github.com/derhuerst/tcp-over-websockets).

When invoked, mitm.js will intercept most calls to create connections,
in particular `net.connect()` and `tls.connect()`. towing-hook will then
to attach the sockets created by mitm.js to tcp-over-websockets, which will
route data from those sockets over a websocket connection.

mitm.js creates mock sockets that behave like raw socket connections, 
notably for sockets created using `tls.connect()`. TLS support is hence
grafted on using [Forge](https://github.com/digitalbazaar/forge).

## Gotchas

### Sockets created manually are not intercepted

mitm.js does not intercept connections made with `net.Socket#connect()`
or `tls.Socket#connect()`, as it does not stub the Socket constructor 
in the `net` module. If your application or dependency uses this for 
connectivity, towing-hook will not route your connection. 

ie, the following will not work:

```js
const net = require('net')
const socket = new net.Socket()

socket.connect(22, 'example.org')
```

but the following will:

```js
const net = require('net')
const socket = net.connect(22, 'example.org')
```

Track [moll/node-mitm#42](https://github.com/moll/node-mitm/issues/42)
for progress on this issue.
