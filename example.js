import Relays from './index.js'
import { ShogunCore } from 'shogun-core'

let relays = await Relays()

console.log(relays)

let shogun = new ShogunCore({
  gunOptions: {
    peers: relays,
  }
})

let gun = shogun.gun;


