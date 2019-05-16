const jwt = require('jsonwebtoken')
const User = require('../model/user')
const JWTTOKEN = process.env.JWTTOKEN
const auth = async (req,res,next)=>{
  try{

    const token = req.header('Authorization').replace('Bearer ','')
    const decoded = jwt.verify(token,JWTTOKEN)
    const user = await User.findOne({_id:decoded._id, 'tokens.token':token})
    if(!user){
      throw new Error()
    }
    req.token = token
    req.user = user
    next()
  }catch(e){
    res.status(401).send({
      error:'please authenticate'
    })
  }
}

module.exports = auth
