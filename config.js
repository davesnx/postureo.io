require('dotenv').config()

const {
  BING_API_KEY,
  INSTAGRAM_UID,
  DATABASE,
  PORT
} = process.env

const CONNECT_OPTIONS = {
  server: {
    socketOptions: {
      keepAlive: 1
    }
  }
}

export {
  BING_API_KEY,
  INSTAGRAM_UID,
  DATABASE,
  PORT,
  CONNECT_OPTIONS
}
