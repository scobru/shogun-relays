import Gun from 'gun'
import getUrls from 'get-urls'

const DEFAULT_PEERS = ['https://shogun-relay.scobrudot.dev/gun', 'https://shogun-linda-relay.scobrudot.dev/gun']

// Use native fetch in browser or node-fetch in Node.js if needed
const fetchImpl = typeof window !== 'undefined' ? window.fetch : typeof global.fetch !== 'undefined' ? global.fetch : (async () => (await import('node-fetch')).default)()

// Suppress extraneous GUN logging
let cl = console.log
console.log = () => {}

// if gun has no results, fetch them from github & update gun
async function fetchRelays() {
  // Ensure fetch is available
  const myFetch = typeof fetchImpl === 'function' ? fetchImpl : await fetchImpl

  let tmpRelays = []
  let res = await myFetch('https://raw.githubusercontent.com/scobru/shogun-relays/main/volunteer.dht.md')
  let data = await res.text()
  let urls = getUrls(data)

  urls = Array.from(urls)
  urls.forEach((u) => {
    let testUrl = new URL(u)

    if (testUrl.pathname === '/gun' && testUrl.pathname.indexOf('~~') === -1) {
      tmpRelays.push(testUrl.href)
    }
  })

  return tmpRelays
}

const Relays = async () => {
  let gunRelays = []

  let gun = new Gun({
    peers: DEFAULT_PEERS,
    file: 'gun-relays',
  })

  // check gun first
  let results = await gun
    .get('gun-relays')
    .get('relays')
    .on((data) => {
      // apparently, don't have to do anything here
    })
    .then()

  if (results) gunRelays = JSON.parse(results)
  else {
    gunRelays = await fetchRelays()
    gun.get('gun-relays').get('relays').put(JSON.stringify(gunRelays))
  }

  // restore normal console logging
  console.log = cl

  return gunRelays
}

export const forceListUpdate = async () => {
  let gun = new Gun({
    peers: DEFAULT_PEERS,
    file: 'gun-relays',
  })

  const newRelays = await fetchRelays()

  gun.get('gun-relays').get('relays').put(JSON.stringify(newRelays))

  // restore normal console logging
  console.log = cl

  return newRelays
}

export default Relays
