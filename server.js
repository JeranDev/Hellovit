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
const stripe = require('stripe')(stripeSecretKey)

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
  quantity: Number,
})

const fulfillOrder = session => {
  // TODO: fill me in
  console.log('Fulfilling order', session)
}

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

app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  (request, response) => {
    const payload = request.body
    const sig = request.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Fulfill the purchase...
      fulfillOrder(session)
    }

    response.status(200)
  }
)

app.post('/form', (req, res) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    auth: {
      user: process.env.JERANDEV_EMAIL,
      pass: process.env.JERANDEV_PASSWORD,
    },
    tls: {
      requireTLS: true,
    },
  })
  transporter.sendMail(
    {
      from: 'jerandev@outlook.com',
      to: 'jerandev@outlook.com',
      subject: 'Hellovit Form Submission',
      html: `
      <h2>${req.body.name}<h1>
      <h3>${req.body.email}
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
