const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SEND_API_KEY)

const sendWelcome  =(email,name)=>{
  sgMail.send({
    to:email,
    from:"shuojianye@gmail.com",
    subject:"Thank you for using my app",
    text:`Welcome to the app, ${name}.Blabla`
  })
}

const sendgoodbye  =(email,name)=>{
  sgMail.send({
    to:email,
    from:"shuojianye@gmail.com",
    subject:"We regret to see this",
    text:`remember what you did today, ${name}.see ya`
  })
}
module.exports = {
  sendWelcome:sendWelcome,
  sendgoodbye:sendgoodbye

}
