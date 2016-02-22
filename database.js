const { DATABASE, PORT } = process.env
import mongoose from 'mongoose'

function connect () {
  const options = {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  }
  return mongoose.connect(DATABASE, options).connection
}

function listen () {
  console.log(`Express app started on port ${PORT}`)
}

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen)
