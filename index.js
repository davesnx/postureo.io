require('dotenv').config()
import request from 'request-promise'
import cheerio from 'cheerio'
import instagram from 'instagram-node'
const insta = instagram.instagram()

const instagrin = 'https://instagr.in'
const BLEND_PAGE_URL = `${instagrin}/blend/`
// const querySiteInstagrin = 'site:instagr.in User Profile'
// const Bing = require('node-bing-api')({ accKey: BING_API_KEY })

// const BING_API_KEY = process.env.BING_API_KEY
const INSTAGRAM_UID = process.env.INSTAGRAM_UID

// TODO: Create a database for save the accessToken
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

function scrappAt (html) {
  let ats = []
  if (!html) throw Error('HTML not valid')
  const $ = cheerio.load(html)
  const nextUrlChildrens = $('.next_url').children()
  if (nextUrlChildrens.length === 0) throw Error('Access Tokens not available')
  nextUrlChildrens.each((i, el) => {
    ats.push(getAccessTokenFromUrl($(el).text()))
  })
  return ats
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

function scrappBlendUrls (html) {
  return new Promise((resolve, reject) => {
    let blendUrls = []
    const $ = cheerio.load(html)
    $('.blend-title a').each((i, el) => {
      blendUrls.push({
        title: $(el).text(),
        url: `${instagrin}${$(el).attr('href')}`
      })
    })
    resolve(blendUrls)
  })
}

function getBlendUrls (blendUrl) {
  return new Promise((resolve, reject) => {
    request(blendUrl)
      .then((html) => resolve(html))
      .catch((err) => reject(err))
  })
}

function followFromBlendUrl (url) {
  return new Promise((resolve, reject) => {
    request(url)
      .then((html) => resolve(html))
      .catch((err) => reject(err))
  })
}

function main () {
  getBlendUrls(BLEND_PAGE_URL)
    .then(html => scrappBlendUrls(html))
    .then(blendUrls => Promise.all(blendUrls.map(url => followFromBlendUrl(url))))
    .then(htmls => Promise.all(htmls.map(html => scrappAt(html).map(token => console.log('TOKEN ->', token)))))
    .catch(err => console.log(err))
}

main()
