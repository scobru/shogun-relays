# shogun-relays
Returns [volunteer GUN relays](https://github.com/amark/gun/wiki/volunteer.dht) for use in your decentralized apps.

## Installation

```bash
npm i shogun-relays
```

## Usage

### Node.js / ES Modules
```js
import Relays, {forceListUpdate} from 'shogun-relays'
import Gun from 'gun'

let relays = await Relays()

console.log(relays)

// Use the relays
let gun = new Gun({peers: relays})

// We can also force an update to the in-network data by pulling straight from the volunteer dht
let freshRelays = await forceListUpdate()
// The `Relays()` function is better suited for everyday use, but it greatly benefits the network if the data is refreshed every once in a while.
```

### Browser (CDN)

```html
<!-- Load Gun from CDN -->
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>

<!-- Load Shogun Relays from CDN -->
<script src="https://cdn.jsdelivr.net/npm/shogun-relays@latest/browser.js"></script>
<!-- Alternative CDN: https://unpkg.com/shogun-relays@latest/browser.js -->

<script>
  // Get relays and initialize Gun
  ShogunRelays.getRelays().then(relays => {
    console.log('Available relays:', relays)
    
    // Initialize Gun with the relay list
    const gun = Gun({peers: relays})
    
    // Use Gun as usual
    gun.get('myapp').put({message: 'Hello, decentralized world!'})
  })
  
  // Force update from GitHub
  ShogunRelays.forceListUpdate().then(relays => {
    console.log('Fresh relays from GitHub:', relays)
  })
</script>
```

**CDN Links:**
- jsDelivr: `https://cdn.jsdelivr.net/npm/shogun-relays@latest/browser.js`
- unpkg: `https://unpkg.com/shogun-relays@latest/browser.js`

#### Browser Options

```js
// Get relays with custom options
ShogunRelays.getRelays({
  peers: ['https://custom-peer.com/gun'],  // Custom initial peers
  timeout: 3000,                            // Timeout for Gun network query (ms)
  localStorage: true,                       // Use localStorage for Gun
  radisk: true,                             // Use radisk for Gun
  verbose: false                            // Show console logs
}).then(relays => {
  console.log(relays)
})
```

#### Live Example

Open `example.html` in your browser to see a working demo with interactive controls.

## API

### `getRelays(options?)`
Returns a list of volunteer GUN relay servers. First checks the Gun network, then falls back to fetching from GitHub if needed.

**Options (Browser only):**
- `peers`: Array of initial peer URLs (default: shogun-eco and wallie relays)
- `timeout`: Timeout in ms for Gun network query (default: 5000)
- `localStorage`: Enable localStorage for Gun (default: true)
- `radisk`: Enable radisk for Gun (default: true)
- `verbose`: Show console logs (default: false)

### `forceListUpdate(options?)`
Forces a fresh fetch from the GitHub volunteer DHT list and updates the Gun network.

## Resources

See the official Wiki here: https://github.com/amark/gun/wiki/volunteer.dht