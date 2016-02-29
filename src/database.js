import mongoose, {Schema} from 'mongoose'
import { DATABASE, PORT, CONNECT_OPTIONS } from './config'

function connect () {
  return mongoose.connect(DATABASE, CONNECT_OPTIONS).connection
}

function listen () {
  console.log(`Database connected on port ${PORT}`)
}

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen)
