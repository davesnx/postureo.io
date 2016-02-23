#!/usr/bin/env node
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
  return new Promise((resolve, reject) => {
    const at = At({ followed: false, at: accessToken })
    at.save((err) => {
      if (err) reject(err)
      debug(`💾  Saved ${accessToken}`)
      resolve(accessToken)
    })
  })
}

function scrappAccessTokens ($dom) {
  return new Promise((resolve, reject) => {
    if (!$dom) reject(Error('Some error with crawling the HTML'))
    const nextUrlChildrens = $dom('.next_url').children()
    if (nextUrlChildrens.length === 0) reject(Error('Access Tokens not available'))
    nextUrlChildrens.each((i, el) => {
      const url = $dom(el).text()
      console.log('THE URL IS ->', url)

      // resolve(getAccessTokenFromUrl(url))
    })
  })
}

function getAccessTokenFromUrl (url) {
  const rg = /access_token=(.*)\&count/
  if (!rg.test(url)) debug(`AccessTokenUrl ${url} isn't correct`)
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

function getBingResults (query, i) {
  return new Promise((resolve, reject) => {
    Bing.web(query, {
      top: 10, // Number of results (max 50)
      skip: i
    }, (err, res, body) => {
      if (err) reject(err)
      resolve(body.d.results)
    })
  })
}

function getAccessTokenFromUsersProfile ($doms) {
  return Promise.all($doms.map(getAccessTokenFromUserProfile))
}

function getAccessTokenFromUserProfile ($dom) {
  return new Promise((resolve, reject) => {
    const elem = $dom('.next_url').text()
    if (elem.length === 0) reject(Error(`Can't found a access_token on UserProfile`))
    const urlAccessToken = getAccessTokenFromUrl(decodeUrl(elem))
    if (!urlAccessToken) reject(Error('urlAccessToken not valid'))
    resolve(urlAccessToken)
  })
}

function decodeUrl (string) {
  if (string.length === 0) debug(`string to decode isn't correct`)
  return Base64.decode(string)
}

function getUrlsFromBingResults (results) {
  return Promise.all(results.map(result => result.Url))
}

function getAccessTokens ($doms) {
  return Promise.all($doms.map(scrappAccessTokens))
}

function scrappUrls (urls) {
  return Promise.all(urls.map(scrapp))
}

function getBlendUrls ($dom) {
  return new Promise((resolve, reject) => {
    let urls = []
    $dom('.blend-title a').each((i, el) => {
      const elm = $dom(el)
      if (!elm) reject(Error(`Blend URL isn't correct`))
      debug(`📖  Reading: ${i} ${elm.text()}`)
      urls.push(`${INSTAGRIN_URL}${elm.attr('href')}`)
    })
    resolve(urls)
  })
}

function followAndSaveTokens (tokens) {
  return Promise.all(tokens.map(token => {
    return saveAccessToken(token).then(followUser)
  }))
}

function getBlendUrl ($dom) {
  return new Promise((resolve, reject) => {
    $dom('.blend-title a').each((i, el) => {
      const text = el.attribs.title
      const href = el.attribs.href
      if (!el) reject(Error(`Blend URL isn't correct`))
      debug(`📖  Reading: ${i} ${text}`)
      resolve(`${INSTAGRIN_URL}${href}`)
    })
  })
}

function blend () {
  scrapp(BLEND_PAGE_URL)
    .then(getBlendUrl)
    .then(scrapp)
    .then(scrappAccessTokens)

    // .then(saveAccessToken)
    // .then(followUser)
    // .catch(err => debug(err))
}

function bing (i) {
  // Command: bing - fast
  getBingResults(QUERY_INSTAGRIN_USERS, i)
    .then(getUrlsFromBingResults)
    .then(scrappUrls)
    .then(getAccessTokenFromUsersProfile)
    .then(followAndSaveTokens)
    .catch(err => debug(err))
}

// bing(5)
blend()

// setInterval(() => {
//   console.log('Running blend')
//
// }, 3000)
