##postureo.io

**It's a Prove of Concept. Isn't a serious project.**

Simple web scraper to get **access_tokens** from _instagr.in_ via scrapping **Google** or scrapping **instagr.in/blend**.

Saving it into a .txt (I will implement a DB).

Use **Instagram API** for following some user or whatever you want with the API.

`With serious problems with 20req/h from Instagram API and Google restrictions.`

>
All info in [elladodelmal.com](http://www.elladodelmal.com/2015/02/growth-hacking-en-instagram-como-robar.html) in a post of **Growth Hacking** in Instagram by **Ariel Ignacio La Cono** [@IgnacioLaCono](https://twitter.com/IgnacioLaCono)


###How to do it:
=========

```shell
npm install
```

Edit _followToken_ with your **{user_id}** or instagram-node requests

```shell
node app.js
```

###Explain the requests
=========

#####/blend
Request __instagr.in/blend__ and get all "next_url" and do the Instagram requests.

#####/scrape
Scrape google indexed instagr.in/u links and added to __'urls.txt'__

#####/read/urls
Get all links from __'urls.txt'__ and request that links regex the access_tokens and do the Instagram requests.

#####/read/tokens
Get all links from __'tokens.txt'__ and do the Instagram requests.


###Explain the txts
=========

#####txt/urls.txt
All urls indexed by Google

#####txt/tokens.txt
All tokens catched in instagr.in/blend and childs
(Could be repeated tokens)

###Dependencies
=========
- express 
- request 
- [cherrio](https://www.npmjs.com/package/cherrio)
- [google](https://www.npmjs.com/package/google)
- [instagram-node](https://www.npmjs.com/package/instagram-node)
- base64
