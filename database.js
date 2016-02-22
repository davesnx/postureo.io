import mongoose, { Schema, model } from 'mongoose'
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

// AccessTokenModel
const accessTokensSchema = new Schema({
  followed: {
    type: Date,
    default: false
  },
  at: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  picturesLiked: {
    type: Array,
    default: []
  }
})

accessTokensSchema.path('at').validate((at) => {
  // Validate unic AccessToken
})

accessTokensSchema.pre('save', (next) => {
  // Validate that the model have always the AccessToken
})

export default mongoose.model('AccessToken', accessTokensSchema)
