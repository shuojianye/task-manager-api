const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')


const app = express()
const port = process.env.PORT 

const multer = require('multer')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port,()=>{
  console.log('server is up on port '+ port)
})

const Task = require('./model/task')
const User = require('./model/user')
