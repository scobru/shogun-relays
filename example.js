import Relays from './index.js'
import Gun from 'gun'

let relays = await Relays()

console.log(relays)

let gun = new Gun({
    peers: relays,
  
})

gun.get('test').put({message: 'Hello, decentralized world!'})
