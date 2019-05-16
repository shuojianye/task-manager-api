const express = require('express')
const User = require('../model/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcome,sendgoodbye} = require("../emails/account")


router.post('/users',async (req,res)=>{
      const user = new User(req.body)
  try{

    const token = await user.generateAuthToken()
    user.tokens = user.tokens.concat({token:token})

    await user.save()
    sendWelcome(user.email,user.name)
    res.status(201).send({user,token})
  } catch(e){
    res.status(400).send(e)
  }


})

router.post('/users/login',async (req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    user.tokens = user.tokens.concat({token:token})
    await user.save()
    res.send({user,token})
  }catch(e){
    res.status(400).send(e.message)
  }
})

router.post('/users/logout',auth,async (req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token!==req.token
    })
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
  try{
    req.user.tokens = []
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})


router.get('/users/me',auth,async (req,res)=>{

  res.send(req.user)
})



router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowUpdate = ['name','email','password','age']
    const isValid = updates.every((update)=>{
      return allowUpdate.includes(update)
    })

    if (!isValid){
      return res.status(400).send({
        error:'invalid updates!'
      })
    }
    try{
      updates.forEach((update)=>{
        req.user[update] = req.body[update]
      })

      await req.user.save()
      res.status(201).send(req.user)
    }catch(e){
      res.status(500).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
  try{
    const user = await req.user.remove()
    sendgoodbye(user.email,user.name)
    res.status(203).send(req.user)
  }catch(e){
    res.status(500).send(e)
  }

})
const upload = multer({

  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb){
    // cb(new Error('File must be a PDF'))
    // cb(undefined,true)
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('Please submit jpg image'))
    }
    cb(undefined,true)
  }
})

const errorMiddleware =(req,res,next)=>{
  throw new Error('From my middleware')
}
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{

  const buffer = await sharp( req.file.buffer).resize({ width:250,height:250}).toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.status(200).send()
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar',async (req,res)=>{
  try{
    const user = await User.findById(req.params.id)
    if(!user.avatar||!user){
      throw new Error()
    }
    res.set('Content-Type','image/jpg')
    res.send(user.avatar)
  }catch(e){
    res.status(404).send(e.message)
  }
})
module.exports  = router
