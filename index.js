import Gun from 'gun'
import { ShogunCore } from 'shogun-core'
import getUrls from 'get-urls'

const DEFAULT_PEERS = [
  'https://5eh4twk2f62autunsje4panime.srv.us/gun',
  'https://peer.wallie.io/gun',
  'https://g3ru5bwxmezpuu3ktnoclbpiw4.srv.us/gun',
  'https://ojepkbvhx4ok25py2qw4hsa76y.srv.us/gun',
]

// Use native fetch in browser or node-fetch in Node.js if needed
const fetchImpl = typeof window !== 'undefined' ? window.fetch : 
  (typeof global.fetch !== 'undefined' ? global.fetch : 
    (async () => (await import('node-fetch')).default)())

// Suppress extraneous GUN logging
let cl = console.log
console.log = () => {}

// if gun has no results, fetch them from github & update gun
async function fetchRelays() {
  // Ensure fetch is available
  const myFetch = typeof fetchImpl === 'function' ? fetchImpl : await fetchImpl
  
  let tmpRelays = []
  let res = await myFetch(
    'https://raw.githubusercontent.com/scobru/shogun-relays/main/volunteer.dht.md'
  )
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

  let shogun = new ShogunCore({
    gunOptions: {
      peers: DEFAULT_PEERS,
      file: 'gun-relays',
    }
  })

  let gun = shogun.gun;

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
  let shogun = new ShogunCore({
    gunOptions: {
      peers: DEFAULT_PEERS,
      file: 'gun-relays',
    }
  })
  
  let gun = shogun.gun;

  const newRelays = await fetchRelays()

  gun.get('gun-relays').get('relays').put(JSON.stringify(newRelays))

  // restore normal console logging
  console.log = cl

  return newRelays
}

export default Relays
