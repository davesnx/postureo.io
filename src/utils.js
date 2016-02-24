require('dotenv').config()

function debug () {
  if (process.env.DEBUG === 'true') {
    console.log(arguments[0])
  }
}

export {
  debug
}
