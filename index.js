import request from 'request-promise'
import cheerio from 'cheerio'
import Bing from 'node-bing-api' // eslint-disable-line no-unused-var
import instagram from 'instagram-node'
import * as At from './database' // eslint-disable-line no-unused-var
import { BING_API_KEY, INSTAGRAM_UID } from './config'

const insta = instagram.instagram()
const INSTAGRIN_URL = 'https://instagr.in'
const BLEND_PAGE_URL = `${INSTAGRIN_URL}/blend/`
Bing({ accKey: BING_API_KEY }) // eslint-disable-line no-unused-var

function saveAccessToken (accessToken) {
  // const at = new At()
  // at.save()
}

// https://datamarket.azure.com/dataset/explore/bing/search
// const querySiteInstagrin = 'site:instagr.in User Profile'
// Bing.web(querySiteInstagrin, {
//   top: 1, // Number of results (max 50)
//   skip: 3 // Skip first 3 results
// }, function (error, res, body) {
//   if (error) console.log('error', error)
//   console.log(body.d.results[0].Url)
// })

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
  if (!rg.test(url)) throw Error('AccessTokenUrl isn\'t correct')
  return rg.exec(url)[1]
}

function followUser (accessToken, userId = INSTAGRAM_UID) {
  console.log(`👌  Follow ${userId} by ${accessToken}`)
  // TODO: Save model to database
  insta.use({ access_token: accessToken })
  insta.set_user_relationship(userId, 'follow', (err, result, remaining, limit) => {
    if (err) console.log('Error ' + err.code + ': ' + err.error_message)
    else console.log(result)
  })
  saveAccessToken(accessToken)
}

function getBlendUrls ($dom) {
  return new Promise((resolve, reject) => {
    let blendUrls = []
    $dom('.blend-title a').each((i, el) => {
      // TODO: Check if it's a correct link/DOMElement and if not reject it
      console.log(`📖  Reading: ${i} ${$dom(el).text()}`)
      blendUrls.push(`${INSTAGRIN_URL}${$dom(el).attr('href')}`)
    })
    resolve(blendUrls)
  })
}

function cheerioLoader (body) {
  return cheerio.load(body)
}

// TODO: way of passing the transform
// Rewrite the scrappMethods to callbacks
function scrapp (url) {
  console.log(`🌐  Scrapping ${url}`)
  return new Promise((resolve, reject) => {
    request({ uri: url, transform: cheerioLoader })
      .then((html) => resolve(html))
      .catch((err) => reject(err))
  })
}

function getAccessTokens ($doms) {
  return Promise.all($doms.map($dom => scrappAccessTokens($dom)))
}

function scrappUrls (urls) {
  return Promise.all(urls.map(url => scrapp(url)))
}

function main () {
  scrapp(BLEND_PAGE_URL)
    .then(getBlendUrls)
    .then(scrappUrls)
    .then(getAccessTokens)
    .then(accessTokens => accessTokens.map(accessToken => {
      setTimeout(() => {
        console.log('accessToken ->', accessToken)
        followUser(accessToken, INSTAGRAM_UID)
      }, 10)
    }))
    .catch(err => console.log(err))
}

main()
