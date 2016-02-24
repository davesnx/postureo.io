import mongoose, { Schema } from 'mongoose'

// AccessTokenModel
const accessTokensSchema = new Schema({
  followed: {
    type: Boolean,
    default: false
  },
  at: {
    type: String,
    unique: true,
    required: true
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

const accessTokenModel = mongoose.model('AccessToken', accessTokensSchema)
export default accessTokenModel
