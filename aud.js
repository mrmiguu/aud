/** @type {AudioContext} */
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const sampleRate = ctx.sampleRate
const createBuffer = ctx.createBuffer

/** @type {Map<AudioBuffer, { src: AudioBufferSourceNode, t: number }>} */
const cache = new Map()

/**
 * @param {string} url 
 */
async function getAudio(url) {
  const resp = await fetch(url)
  const data = await resp.arrayBuffer()
  return decodeAudioData(data)
}

/**
 * @param {ArrayBuffer} data 
 */
function decodeAudioData(data) {
  return new Promise(

    /**
     * @param {(audio: AudioBuffer) => void} res
     */
    function (res, rej) {
      return ctx.decodeAudioData(data, res, rej)
    }

  )
}

/**
 * @param {AudioBuffer} audio 
 */
function play(audio) {

  /** @type {AudioBufferSourceNode} */
  const src = ctx.createBufferSource()

  let a = cache.get(audio)
  if (!a) {
    console.log('play: track not found in cache; caching...')
    cache.set(audio, a = { src, t: 0 })
  }
  const t = a.t

  src.buffer = audio
  src.connect(ctx.destination)
  src.onended = () => {
    console.log(`track ended`)
    // cache.delete(audio)
  }
  src.start(0, t)
  console.log(`track started @ ${t}`)
}

/**
 * @param {AudioBuffer} audio 
 */
function pause(audio) {

  const a = cache.get(audio)
  if (!a) {
    console.log('pause: track not found in cache; caching...')
    return
  }

  console.log(`ctx.currentTime ${ctx.currentTime}`)

  a.t = ctx.currentTime
  a.src.stop()
}

export {
  ctx,
  getAudio,
  play,
  pause
}
