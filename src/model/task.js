const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const taskSchema = new mongoose.Schema({
  description:{
    type:String,
    required: true,
    trim: true
  },
  Completed:{
    type:Boolean,
    default: false
  },
  author:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  }
},{
  timestamps:true
})


taskSchema.pre('save',async function (next){
  const task = this
  // if (task.isModified('password')){
  //   user.password = await bcrypt.hash(user.password,8)
  //   console.log('hhhhh')
  // }
  console.log('save task')
  next()
})


var Task = mongoose.model('Task',taskSchema)

module.exports = Task
