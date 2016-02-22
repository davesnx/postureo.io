import Promise from 'bluebird'
import './database'
import request from 'request-promise'
import cheerio from 'cheerio'
import instagram from 'instagram-node'
import At from './model'
import { BING_API_KEY, INSTAGRAM_UID } from './config'
import {debug} from './utils.js'
import { Base64 } from 'js-base64'

const insta = instagram.instagram()
const INSTAGRIN_URL = 'https://instagr.in'
const BLEND_PAGE_URL = `${INSTAGRIN_URL}/blend/`
const QUERY_INSTAGRIN_USERS = 'site:instagr.in User Profile'
const Bing = require('node-bing-api')({ accKey: BING_API_KEY })

function delay (time) {
  return new Promise((fn) => {
    setTimeout(fn, time)
  })
}

function saveAccessToken (accessToken) {
  debug(`💾  Saved ${accessToken}`)
  const at = At({ followed: false, at: accessToken })
  at.save((err) => {
    if (err) debug(err)
    console.log('accessToken saved!')
  })
}

function scrappAccessTokens ($dom) {
  return new Promise((resolve, reject) => {
    let ats = []
    if (!$dom) reject(Error('Some error with crawling the HTML'))
    const nextUrlChildrens = $dom('.next_url').children()
    if (nextUrlChildrens.length === 0) reject(Error('Access Tokens not available'))
    nextUrlChildrens.each((i, el) => {
      ats.push(getAccessTokenFromUrl($dom(el).text()))
    })
    resolve(ats[0])
  })
}

function getAccessTokenFromUrl (url) {
  const rg = /access_token=(.*)\&count/
  if (!rg.test(url)) Error(`AccessTokenUrl ${url} isn't correct`)
  return rg.exec(url)[1]
}

function followUser (accessToken, userId = INSTAGRAM_UID) {
  debug(`👌  Follow ${userId} by ${accessToken}`)
  insta.use({ access_token: accessToken })
  insta.set_user_relationship(userId, 'follow', (err, result, remaining, limit) => {
    if (err) debug('Error ' + err.code + ': ' + err.error_message)
    else {
      debug(result)
      return accessToken
    }
  })
}

function scrapp (url) {
  debug(`🌐  Scrapping ${url}`)
  return new Promise((resolve, reject) => {
    request({ uri: url, transform: (body) => cheerio.load(body) })
      .then((html) => resolve(html))
      .catch((err) => reject(err))
  })
}

function getBingResults (query) {
  return new Promise((resolve, reject) => {
    Bing.web(query, {
      top: 40, // Number of results (max 50)
      skip: 1
    }, (err, res, body) => {
      if (err) reject(err)
      resolve(body.d.results)
    })
  })
}

function getAccessTokenFromUserProfile ($dom) {
  return new Promise((resolve, reject) => {
    const urlAccessToken = getAccessTokenFromUrl(decodeUrl($dom('.next_url').text()))
    if (!urlAccessToken) reject(Error('urlAccessToken not valid'))
    resolve(urlAccessToken)
  })
}

function decodeUrl (string) {
  return Base64.decode(string)
}

function getUrlsFromBingResults (results) {
  return Promise.all(results.map(result => result.Url))
}

function getAccessTokenFromUsersProfile ($doms) {
  return Promise.all($doms.map(getAccessTokenFromUserProfile))
}

function getAccessTokens ($doms) {
  return Promise.all($doms.map(scrappAccessTokens))
}

function map (arr, fn) {
  return Promise.all(arr.map(fn))
}

function scrappUrls (urls) {
  return Promise.all(urls.map(scrapp))
}

function scrappUserProfiles (urls) {
  return Promise.all(urls.map(url => {
    return scrapp(url).then(getAccessTokenFromUserProfile)
  }))
}

function followUsers (users) {
  return users.map(user => {
    followUser(user)
  })
}

function saveAccessTokens (users) {
  return users.map(user => {
    saveAccessToken(user)
  })
}

function getBlendUrls ($dom) {
  return new Promise((resolve, reject) => {
    let urls = []
    $dom('.blend-title a').each((i, el) => {
      // TODO: Check if it's a correct link/DOMElement and if not reject it
      const elm = $dom(el)
      if (!elm) reject(Error(`Blend URL isn't correct`))
      debug(`📖  Reading: ${i} ${elm.text()}`)
      urls.push(`${INSTAGRIN_URL}${elm.attr('href')}`)
    })
    resolve(urls)
  })
}

function followAndSaveTokens (tokens) {
  return tokens.map(token => {
    saveAccessToken(token)
    delay(1000).then(followUser(token))
  })
}

function main () {
  // Command: blends (?) - slow
  // scrapp(BLEND_PAGE_URL)
  //   .then(getBlendUrls)
  //   .then(scrappUrls)
  //   .then(getAccessTokens)
  //   .then(followAndSaveTokens)
  //   .catch(err => debug(err))

  // Command: bing - fast
  getBingResults(QUERY_INSTAGRIN_USERS)
    .then(getUrlsFromBingResults)
    .then(scrappUserProfiles)
    .then(followUsers)
    .then(saveAccessTokens)
    .catch(err => debug(err))
}

main()
