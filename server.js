if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

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
  fs.readFile('items.json', (err, data) => {
    if (err) {
      res.status(500).end()
    } else {
      res.render('merch.ejs', {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data),
      })
    }
  })
})

app.post('/purchase', (req, res) => {
  fs.readFile('items.json', (err, data) => {
    if (err) {
      res.status(500).end()
    } else {
      const itemsJson = JSON.parse(data)
      const itemsArray = itemsJson.merch.concat()
      let total = 0
      req.body.items.forEach((item) => {
        const itemJson = itemsArray.find((i) => {
          return i.id == item.id
        })
        total = total + itemJson.price * item.quantity
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
        .catch((err) => {
          console.log('Charge Failed!')
          console.log(err)
          res.status(500).end()
        })
    }
  })
})

app.listen(3000)