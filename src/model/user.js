const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const JWTTOKEN = process.env.JWTTOKEN

const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age:{
    type:Number,
    default:0,
    validate(value){
      if (value<0){
        throw new Error('Age must be a postitive number')
      }
    }
  },
  email:{
    type: String,
    unique: true,
    required: true,

    trim:true,
    lowercase:true,
    validate(value){
      if (!validator.isEmail(value)){
        throw new Error(' email 不符合规定')
      }
    }
  },
  password:{
    type: String,
    required: true,
    trim:true,
    validate(value){
      if (value.toLowerCase().includes('password')){
        throw new Error('include password')
      }else if (value.length<6){
        throw new Error('length should be greater than 6')
      }
    }
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  avatar:{
    type:Buffer
  }
},{
  timestamps:true
})

userSchema.methods.toJSON = function(){
  const user = this
  const userObj = user.toObject()
  delete userObj.tokens
  delete userObj.password
  delete userObj.avatar
  return userObj
}

userSchema.virtual('task',{
  ref:'Task',
  localField:'_id',
  foreignField:'author'
})
userSchema.methods.generateAuthToken = async function(){
  const user = this
  const token = jwt.sign({_id:user.id.toString()},JWTTOKEN)
  return token
}
userSchema.statics.findByCredentials = async (email,password)=>{
  const user = await User.findOne({email:email})
  if (!user){
    throw new Error('unable to loggin no user')
  }
  const isMatch = await bcrypt.compare(password,user.password)
  if (!isMatch){
    throw new Error('unable to loggin no match password')
  }
  return user
}
//Hash the plain text
userSchema.pre('save',async function (next){
  const user = this
  if (user.isModified('password')){
    user.password = await bcrypt.hash(user.password,8)
    console.log('hhhhh')
  }
  next()
})

//delete users' tasks when user got deleted
userSchema.pre('remove',async function (next){
  const user = this
  await Task.deleteMany({author:user._id})
  next()
})

const User = mongoose.model('User',userSchema)

module.exports = User
