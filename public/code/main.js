if (document.readyState == 'loading') {
  document.addEventListener('DOMContentLoaded', ready)
} else {
  ready()
}

const stripe = Stripe(stripePublicKey)

function ready() {
  const addToCartBtns = document.querySelectorAll('.shop-item-button')
  addToCartBtns.forEach(button => {
    button.addEventListener('click', addToCartClicked)
  })
  document
    .querySelector('.btn-purchase')
    .addEventListener('click', purchaseClicked)
}

function stripeHandler() {
  const products = []
  const cartItemContainer = document.querySelector('.cart-items')
  const cartRows = cartItemContainer.querySelectorAll('.cart-row')

  cartRows.forEach(row => {
    const quantityElement = row.querySelector('.cart-quantity-input')
    const quantity = quantityElement.value
    const id = row.dataset.itemId
    products.push({
      price: id,
      quantity: Number(quantity),
    })
  })

  stripe
    .redirectToCheckout({
      lineItems: products,
      mode: 'payment',
      successUrl: 'https://hellovitproject.herokuapp.com/success',
      cancelUrl: 'https://hellovitproject.herokuapp.com/store',
    })
    .then(function (result) {
      if (result.error) {
        const displayError = document.getElementById('error-message')
        displayError.textContent = result.error.message
      }
    })
}

function purchaseClicked() {
  const priceElement = document.querySelector('.cart-total-price')
  const price = parseFloat(priceElement.innerText.replace('$', '')) * 100
  stripeHandler(price)
}

function removeCartItem(event) {
  const buttonClicked = event.target
  buttonClicked.parentElement.parentElement.remove()
  updateCartTotal()
}

function quantityChanged(event) {
  const input = event.target
  if (isNaN(input.value) || input.value <= 0 || input.value > 5) {
    input.value = 1
  }
  updateCartTotal()
}

function addToCartClicked(event) {
  const button = event.target
  const shopItem = button.parentElement.parentElement
  const title = shopItem.querySelector('.shop-item-title').innerText
  const price = shopItem.querySelector('.shop-item-price').innerText
  const imgSrc = shopItem.querySelector('.shop-item-image').src
  const id = shopItem.dataset.itemId
  addItemToCart(title, price, imgSrc, id)
  updateCartTotal()
}

function addItemToCart(title, price, imgSrc, id) {
  const cartRow = document.createElement('div')
  cartRow.classList.add('cart-row')
  cartRow.dataset.itemId = id
  const cartItems = document.querySelector('.cart-items')
  const cartItemNames = cartItems.querySelectorAll('.cart-item-title')
  for (let i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert('This item is already added to the cart')
      return
    }
  }
  const cartRowContents = `
      <div class="cart-item cart-column">
        <img
          class="cart-item-image"
          src="${imgSrc}"
          width="100"
          height="100"
        />
        <span class="cart-item-title">${title}</span>
      </div>
      <span class="cart-price cart-column">${price}</span>
      <div class="cart-quantity cart-column">
        <input class="cart-quantity-input" type="number" value="1" />
        <button class="btn btn-danger btn-remove" type="button">REMOVE</button>
      </div>`
  cartRow.innerHTML = cartRowContents
  cartItems.append(cartRow)
  cartRow.querySelector('.btn-danger').addEventListener('click', removeCartItem)
  cartRow
    .querySelector('.cart-quantity-input')
    .addEventListener('change', quantityChanged)
}

function updateCartTotal() {
  const cartItemContainer = document.querySelector('.cart-items')
  const cartRows = cartItemContainer.querySelectorAll('.cart-row')
  let total = 0
  cartRows.forEach(row => {
    const priceElement = row.querySelector('.cart-price')
    const quantityElement = row.querySelector('.cart-quantity-input')
    const price = parseFloat(priceElement.innerText.replace('$', ''))
    const quantity = quantityElement.value
    total = total + price * quantity
  })
  total = Math.round(total * 100) / 100
  document.querySelector('.cart-total-price').innerText = '$' + total
}
