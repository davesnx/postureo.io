require('dotenv').config()
import request from 'request-promise'
import cheerio from 'cheerio'
import instagram from 'instagram-node'
import _ from 'lodash'
const insta = instagram.instagram()

const instagrin = 'https://instagr.in'
const BLEND_PAGE_URL = `${instagrin}/blend/`
// const querySiteInstagrin = 'site:instagr.in User Profile'
// const Bing = require('node-bing-api')({ accKey: BING_API_KEY })

// const BING_API_KEY = process.env.BING_API_KEY
const INSTAGRAM_UID = process.env.INSTAGRAM_UID

// TODO: Create a database for save the accessToken, with followed, date, picturesLiked
// TODO: Create method to like media items https://github.com/mckelvey/instagram-node-lib
// TODO: Search 'https://instagr.in/t/{:tag}' and getAccessToken
// https://datamarket.azure.com/dataset/explore/bing/search
// Bing.web(querySiteInstagrin, {
//   top: 1, // Number of results (max 50)
//   skip: 3 // Skip first 3 results
// }, function (error, res, body) {
//   if (error) console.log('error', error)
//   console.log(body.d.results[0].Url)
// })

function scrappAt ($) {
  return new Promise((resolve, reject) => {
    let ats = []
    if (!$) reject(Error('Some error with parsing the HTML'))
    const nextUrlChildrens = $('.next_url').children()
    if (nextUrlChildrens.length === 0) reject(Error('Access Tokens not available'))
    console.log('nextUrlChildrens', nextUrlChildrens)
    nextUrlChildrens.each((i, el) => {
      ats.push(getAccessTokenFromUrl($(el).text()))
    })
    resolve(ats)
  })
}

function getAccessTokenFromUrl (url) {
  const rg = /access_token=(.*)\&count/
  if (!rg.test(url)) throw Error('AccessTokenUrl isn\'t correct')
  return rg.exec(url)[1]
}

function followUser (accessToken, userId) {
  insta.use({
    access_token: accessToken
  })
  insta.set_user_relationship(userId, 'follow', (err, result, remaining, limit) => {
    if (err) console.log('Error ' + err.code + ': ' + err.error_message)
    else console.log(result)
  })
}

function scrappBlendUrls ($) {
  return new Promise((resolve, reject) => {
    let blendUrls = []
    $('.blend-title a').each((i, el) => {
      // TODO: Check if it's a correct link/DOMElement and if not reject it
      console.log(`Reading ${$(el).text()}`)
      blendUrls.push(`${instagrin}${$(el).attr('href')}`)
    })
    resolve(blendUrls)
  })
}

function cheerioLoader (body) {
  return cheerio.load(body)
}

function scrapp (url) {
  console.log(`Scrapping ${url}`)
  return new Promise((resolve, reject) => {
    request({uri: url, transform: cheerioLoader})
      .then((html) => resolve(html))
      .catch((err) => reject(err))
  })
}

function main () {
  scrapp(BLEND_PAGE_URL)
    .then($blendPageDOM => scrappBlendUrls($blendPageDOM))
    .then(childBlendUrls => Promise.all(childBlendUrls.map(childBlendUrl => scrapp(childBlendUrl))))
    .then($childBlendDOMs => Promise.all($childBlendDOMs.map($childBlendDOM => scrappAt($childBlendDOM))))
    .then(accessTokens => _.chunk(accessTokens).map(accessToken => {
      setTimeout(() => {
        console.log('accessToken', accessToken)
        followUser(accessToken, INSTAGRAM_UID)
      }, 3000)
    }))
    .catch(err => console.log(err))
}

main()
