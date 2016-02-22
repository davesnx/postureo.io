import { Schema, model } from 'mongoose'

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

export default model('accessTokens', accessTokensSchema)
