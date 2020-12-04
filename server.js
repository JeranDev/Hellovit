if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const mailchimp = require('@mailchimp/mailchimp_marketing')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'r00t',
  database: 'test',
})

connection.connect()



mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
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
  connection.query('SELECT * FROM `products` WHERE 1',  (error, results) => {
    if (error) {
      res.render('error', {error: error})
    } else {
      res.render('store', {
        stripePublicKey: stripePublicKey,
        products: results,
      })
    }
  })
})

app.get('/success', (req, res) => {
  res.render('success', {})
})

app.post('/subscribe', async (req, res) => {
  try {
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      {
        email_address: req.body.email,
        status: 'subscribed',
      }
    )
    res.render('emailSuccess', {})
  } catch {
    res.render('emailError', {})
  }
})

app.post('/form', (req, res) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.HELLOVIT_EMAIL,
      pass: process.env.HELLOVIT_PASSWORD,
    },
  })
  transporter.sendMail(
    {
      from: 'hellovitplaceholder@gmail.com',
      to: 'hellovitplaceholder@gmail.com',
      subject: 'Hellovit Form Submission',
      html: `
      <h2>${req.body.name}<h2>
      <p>${req.body.email}<p>
      <p>${req.body.message}</p>
      `,
    },
    error => {
      if (error) {
        res.render('error', { error: error })
      } else {
        res.render('sent', {})
      }
    }
  )
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
