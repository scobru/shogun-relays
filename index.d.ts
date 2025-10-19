/**
 * Fetches and returns a list of volunteer GUN relay URLs.
 * 
 * This function first checks for cached relays in GUN, and if not found,
 * fetches them from the GitHub wiki and stores them for future use.
 * 
 * @returns A promise that resolves to an array of relay URL strings
 * 
 * @example
 * ```typescript
 * import Relays from 'gun-relays'
 * 
 * const relays = await Relays()
 * console.log(relays) // ['https://relay1.example.com/gun', ...]
 * ```
 */
declare function Relays(): Promise<string[]>

/**
 * Forces an update of the relay list by fetching fresh data from GitHub
 * and updating the GUN database.
 * 
 * Use this function when you want to bypass the cache and get the latest
 * relay list directly from the source.
 * 
 * @returns A promise that resolves to an array of updated relay URL strings
 * 
 * @example
 * ```typescript
 * import { forceListUpdate } from 'gun-relays'
 * 
 * const newRelays = await forceListUpdate()
 * console.log(newRelays) // ['https://relay1.example.com/gun', ...]
 * ```
 */
export declare function forceListUpdate(): Promise<string[]>

export default Relays

