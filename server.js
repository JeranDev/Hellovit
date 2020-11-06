if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const Items = mongoose.model('Items', {
  name: String,
  price: Number,
  imgName: String,
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

app.get('/merch', (req, res) => {
  Items.find({}, (err, results) => {
    if (err) {
      console.log(err)
      res.status(500).end()
    } else {
      res.render('merch', {
        stripePublicKey: stripePublicKey,
        items: results,
      })
    }
  })
})

app.post('/purchase', (req, res) => {
  Items.find({}, (err, results) => {
    if (err) {
      res.status(500).end()
    } else {
      let total = 0
      req.body.items.forEach(item => {
        const result = results.find(i => {
          return i.id == item.id
        })
        total = total + result.price * item.quantity
      })
      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: 'usd',
        })
        .then(() => {
          console.log('Charge Successful')
          res.json({ message: 'Successfully Purchased Items!' })
        })
        .catch(err => {
          console.log('Charge Failed!')
          console.log(err)
          res.status(500).end()
        })
    }
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
