if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
  } else {
    ready()
  }
  
  function ready() {
    const removeCartItemBtns = document.querySelectorAll('.btn-danger')
    removeCartItemBtns.forEach((button) => {
      button.addEventListener('click', removeCartItem)
    })
  
    const quantityInputs = document.querySelectorAll('.cart-quantity-input')
    quantityInputs.forEach((input) => {
      input.addEventListener('change', quantityChanged)
    })
  
    const addToCartBtns = document.querySelectorAll('.shop-item-button')
    addToCartBtns.forEach((button) => {
      button.addEventListener('click', addToCartClicked)
    })
  
    document
      .querySelector('.btn-purchase')
      .addEventListener('click', purchaseClicked)
  }
  
  function purchaseClicked() {
    alert('Thank you for your purchase!')
    const cartItems = document.querySelector('.cart-items')
    while (cartItems.hasChildNodes()) {
      cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
  }
  
  function removeCartItem(event) {
    const buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
  }
  
  function quantityChanged(event) {
    const input = event.target
    if (isNaN(input.value) || input.value <= 0) {
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
    console.log(title, price, imgSrc)
    addItemToCart(title, price, imgSrc)
    updateCartTotal()
  }
  
  function addItemToCart(title, price, imgSrc) {
    const cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    const cartItems = document.querySelector('.cart-items')
    const cartItemNames = cartItems.querySelectorAll('.cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
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
        <button class="btn btn-danger" type="button">REMOVE</button>
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
    cartRows.forEach((row) => {
      const priceElement = row.querySelector('.cart-price')
      const quantityElement = row.querySelector('.cart-quantity-input')
      const price = parseFloat(priceElement.innerText.replace('$', ''))
      const quantity = quantityElement.value
      total = total + price * quantity
    })
    total = Math.round(total * 100) / 100
    document.querySelector('.cart-total-price').innerText = '$' + total
  }
  
  $('.carousel').carousel({
    interval: 3000,
    pause: false,
  })
  