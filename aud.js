/** @type {AudioContext} */
const ctx = new (window.AudioContext || window.webkitAudioContext)()

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
    cache.set(audio, a = { t: 0 })
  }

  a.src = src

  src.buffer = audio
  src.connect(ctx.destination)
  src.onended = () => {
    console.log(`track ended`)
    // cache.delete(audio)
  }
  src.start(0, a.t)
  console.log(`track started @ ${a.t}`)
}

/**
 * @param {AudioBuffer} audio 
 */
function stop(audio) {
  freeze(audio, 0)
}

/**
 * @param {AudioBuffer} audio 
 */
function pause(audio) {
  freeze(audio, ctx.currentTime)
}

/**
 * @param {AudioBuffer} audio 
 * @param {number} t
 */
function freeze(audio, t) {

  const a = cache.get(audio)
  if (!a) {
    console.log('freeze: track not found in cache; caching...')
    return
  }

  console.log(`freeze: t ${t}`)

  a.t = t
  a.src.stop()
}

export {
  ctx,
  getAudio,
  decodeAudioData,
  play,
  pause,
  stop,
  freeze,
}
