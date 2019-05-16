const express = require('express')
const Task = require('../model/task')
const User = require('../model/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth,async (req,res)=>{
  const task = new Task({
    ...req.body,
    author:req.user._id
  })
  try{
    await task.save()
    res.status(200).send(task)
  }catch(e){
    res.status(500).send(e)
  }

})

//Get tasks?completed=false
//Get /task?limit=10&skip=10
//Get /task?sortBy=createdAt_asc
router.get('/tasks', auth,async (req,res)=>{
  const match = {}
  const sort = {}
  if(req.query.completed){

    match.Completed = req.query.completed ==='true'
  }
  if(req.query.sortBy){

    const parts = req.query.sortBy.split('_')
    sort[parts[0]]=parts[1]==='desc'?-1:1
  }
  try{
    // const tasks = await Task.find({author:req.user._id})
    await req.user.populate({
      path:'task',
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort

      }
    }).execPopulate()
    res.status(200).send(req.user.task)

  }catch(e){
    res.status(500).send(e)
  }

})

router.get('/tasks/:id',auth,async (req,res)=>{
  const _id = req.params.id
  try{
    const tasks = await Task.findOne({_id:_id,author:req.user._id})
    if(!tasks){
      return res.status(404).send('Task not found')
    }
    res.status(201).send(tasks)
  }catch(e){
    res.status(500).send('cannot connect to task storage')
  }

})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowUpdate = ['Completed','description']
    const isValid = updates.every((update)=>{
      return allowUpdate.includes(update)
    })
    if (!isValid){
      return res.status(400).send({
        error:'invalid updates!'
      })
    }
    try{
      const task = await Task.findOne({_id:_id,author: req.user._id})
      if (!task){
        return res.status(404).send('task not found')
      }
      updates.forEach((update)=>{
        task[update] = req.body[update]
      })
      await task.save()
      res.status(201).send(task)
    }catch(e){
      res.status(500).send(e)
    }
})


router.delete('/tasks/:id',auth,async (req,res)=>{
  const _id = req.params.id
  try{

    const task = await Task.findOneAndDelete({_id:_id, author: req.user._id})
    if(!task){
       res.status(404).send()
    }

    res.status(201).send(task)
  }catch(e){
    res.status(500).send(e.message)
  }

})
module.exports  = router
