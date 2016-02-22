import request from 'request-promise'
import cheerio from 'cheerio'
import Bing from 'node-bing-api' // eslint-disable-line no-unused-var
import instagram from 'instagram-node'

require('./database.js')
require('dotenv').config()
const { BING_API_KEY, INSTAGRAM_UID } = process.env

const insta = instagram.instagram()
Bing({ accKey: BING_API_KEY }) // eslint-disable-line no-unused-var
const INSTAGRIN_URL = 'https://instagr.in'
const BLEND_PAGE_URL = `${INSTAGRIN_URL}/blend/`

// TODO: Create a database for save the accessToken, with followed, date, picturesLiked
// TODO: Use Bing for search for 'site:instagr.in User Profile' and scrap
// TODO: Implement crawlAccessTokenFromUserProfile with base64 decode
// TODO: Create method to like media items https://github.com/mckelvey/instagram-node-lib
// https://datamarket.azure.com/dataset/explore/bing/search
// const querySiteInstagrin = 'site:instagr.in User Profile'
// Bing.web(querySiteInstagrin, {
//   top: 1, // Number of results (max 50)
//   skip: 3 // Skip first 3 results
// }, function (error, res, body) {
//   if (error) console.log('error', error)
//   console.log(body.d.results[0].Url)
// })

function crawlAccessTokens ($) {
  return new Promise((resolve, reject) => {
    let ats = []
    if (!$) reject(Error('Some error with crawling the HTML'))
    const nextUrlChildrens = $('.next_url').children()
    if (nextUrlChildrens.length === 0) reject(Error('Access Tokens not available'))
    nextUrlChildrens.each((i, el) => {
      ats.push(getAccessTokenFromUrl($(el).text()))
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
  // insta.use({ access_token: accessToken })
  // insta.set_user_relationship(userId, 'follow', (err, result, remaining, limit) => {
  //   if (err) console.log('Error ' + err.code + ': ' + err.error_message)
  //   else console.log(result)
  // })
}

function scrappBlendUrls ($) {
  return new Promise((resolve, reject) => {
    let blendUrls = []
    $('.blend-title a').each((i, el) => {
      // TODO: Check if it's a correct link/DOMElement and if not reject it
      console.log(`📖  Reading: ${i} ${$(el).text()}`)
      blendUrls.push(`${INSTAGRIN_URL}${$(el).attr('href')}`)
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

function main () {
  scrapp(BLEND_PAGE_URL)
    .then(scrappBlendUrls)
    .then(childBlendUrls => Promise.all(childBlendUrls.map(childBlendUrl => scrapp(childBlendUrl))))
    .then($childBlendDOMs => Promise.all($childBlendDOMs.map($childBlendDOM => crawlAccessTokens($childBlendDOM))))
    .then(accessTokens => accessTokens.map(accessToken => {
      setTimeout(() => {
        console.log('accessToken ->', accessToken)
        followUser(accessToken, INSTAGRAM_UID)
      }, 10)
    }))
    .catch(err => console.log(err))
}

main()
