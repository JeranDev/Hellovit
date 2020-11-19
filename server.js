if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const Items = mongoose.model('Items', {
  name: String,
  price: Number,
  imgName: String,
  stripeId: String,
})

app.get('/', (req, res) => {
  res.render('index', {})
})

app.get('/shows', (req, res) => {
  res.render('shows', {})
})

app.get('/artists', (req, res) => {
  res.render('artists', {})
})

app.get('/contact', (req, res) => {
  res.render('contact', {})
})

app.get('/about', (req, res) => {
  res.render('about', {})
})

app.get('/store', (req, res) => {
  Items.find({}, (err, results) => {
    if (err) {
      console.log(err)
      res.status(500).end()
    } else {
      res.render('store', {
        stripePublicKey: stripePublicKey,
        items: results,
      })
    }
  })
})

app.get('/success', (req, res) => {
  res.render('success', {})
})

app.post('/form', (req, res) => {
  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'mail.jerandev.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.JERANDEV_EMAIL,
        pass: process.env.JERANDEV_PASSWORD,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"${req.body.name}" <${req.body.email}>`, // sender address
      to: 'jerandev@outlook.com', // list of receivers
      subject: 'Hellovit Form Submission', // Subject line
      text: req.body.message, // plain text body
      html: `<b>${req.body.message}</b>`, // html body
    })

    console.log('Message sent: %s', info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  }
  main().catch(console.error)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
