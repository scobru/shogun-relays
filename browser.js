/**
 * Shogun Relays - Browser Version
 * Returns volunteer GUN relays for use in your decentralized apps.
 *
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
 *   <script src="browser.js"></script>
 *   <script>
 *     ShogunRelays.getRelays().then(relays => {
 *       console.log('Relays:', relays)
 *       const gun = Gun({peers: relays})
 *     })
 *   </script>
 */

;(function (window) {
  'use strict'

  // Extract URLs from text (simplified version of get-urls)
  function extractUrls(text) {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g
    const matches = text.match(urlRegex) || []
    return Array.from(new Set(matches))
  }

  // Fetch relays from GitHub
  async function fetchRelaysFromGitHub() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/scobru/shogun-relays/main/volunteer.dht.md', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.text()
      const urls = extractUrls(data)

      const relays = []
      urls.forEach((url) => {
        try {
          const testUrl = new URL(url)
          // Only include URLs ending with /gun and not containing ~~
          if (testUrl.pathname === '/gun' && url.indexOf('~~') === -1) {
            relays.push(testUrl.href)
          }
        } catch (e) {
          // Invalid URL, skip it
        }
      })

      return relays
    } catch (error) {
      // Only log as warning if it's a network/CORS issue, not a critical error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('Unable to fetch relays from GitHub (network/CORS issue). Using default relays.')
      } else {
        console.warn('Error fetching relays from GitHub:', error.message || error)
      }
      return []
    }
  }

  // Get relays from GUN network or GitHub
  async function getRelays(options = {}) {
    const defaultPeers = options.peers || ['https://shogun-relay.scobrudot.dev/gun', 'https://shogun-linda-relay.scobrudot.dev/gun']

    let gunRelays = []

    // Suppress GUN logging temporarily
    const originalLog = console.log
    if (!options.verbose) {
      console.log = () => {}
    }

    try {
      // Check if Gun is available
      if (typeof Gun === 'undefined') {
        console.warn('Gun not found, fetching relays directly from GitHub')
        gunRelays = await fetchRelaysFromGitHub()
        return gunRelays
      }

      // Initialize Gun
      const gun = Gun({
        peers: defaultPeers,
        localStorage: options.localStorage !== false,
        radisk: options.radisk !== false,
        file: 'gun-relays',
      })

      // Try to get relays from Gun network
      const results = await new Promise((resolve) => {
        let timeout = setTimeout(() => resolve(null), options.timeout || 5000)

        gun
          .get('gun-relays')
          .get('relays')
          .once((data) => {
            clearTimeout(timeout)
            resolve(data)
          })
      })

      if (results) {
        gunRelays = JSON.parse(results)
      } else {
        // Fetch from GitHub if Gun network doesn't have results
        gunRelays = await fetchRelaysFromGitHub()

        // Store in Gun for future use
        if (gunRelays.length > 0) {
          gun.get('gun-relays').get('relays').put(JSON.stringify(gunRelays))
        }
      }
    } catch (error) {
      console.error('Error getting relays:', error)
      // Fallback to GitHub
      gunRelays = await fetchRelaysFromGitHub()
    } finally {
      // Restore console logging
      if (!options.verbose) {
        console.log = originalLog
      }
    }

    return gunRelays
  }

  // Force update the relay list from GitHub
  async function forceListUpdate(options = {}) {
    const defaultPeers = options.peers || ['https://shogun-relay.scobrudot.dev/gun', 'https://shogun-linda-relay.scobrudot.dev/gun']

    const newRelays = await fetchRelaysFromGitHub()

    // Update Gun network if available
    if (typeof Gun !== 'undefined' && newRelays.length > 0) {
      const gun = Gun({
        peers: defaultPeers,
        localStorage: options.localStorage !== false,
        radisk: options.radisk !== false,
        file: 'gun-relays',
      })

      gun.get('gun-relays').get('relays').put(JSON.stringify(newRelays))
    }

    return newRelays
  }

  // Export to window
  window.ShogunRelays = {
    getRelays: getRelays,
    forceListUpdate: forceListUpdate,
    fetchRelaysFromGitHub: fetchRelaysFromGitHub,
  }
})(window)
