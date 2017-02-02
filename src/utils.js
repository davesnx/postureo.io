import request from 'request-promise'
import cheerio from 'cheerio'
require('dotenv').config()

function debug () {
  if (process.env.DEBUG === 'true') {
    console.log(arguments[0])
  }
}

function delay (time) {
  return new Promise((fn) => {
    setTimeout(fn, time)
  })
}

function cheerioLoader (body) {
  return cheerio.load(body)
}

function scrapp (url) {
  debug(`🌐  Scrapping ${url}`)
  return new Promise((resolve, reject) => {
    request({ uri: url, transform: cheerioLoader })
      .then((html) => resolve(html))
      .catch((err) => reject(err))
  })
}

export { debug, scrapp, delay }
