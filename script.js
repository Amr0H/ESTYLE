const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}


let cart = JSON.parse(localStorage.getItem('cart')) || [];

const coupons = [
    { code: "AMR", discount: 10, type: 'percentage', description: "10% off your first order" },
    { code: "EST-GUELMIM", discount: 20, type: 'percentage', description: "20% off your entire order" },
    { code: "FIRST-ORDER", discount: 25, type: 'fixed', description: "25 Dhs shipping discount" },
    { code: "AHMED-SABA", discount: 50, type: 'percentage', description: "50% off (demo only)" }
];

let appliedCoupon = null;

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-item-count').forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => 
        item.name === product.name && 
        (!product.size || item.size === product.size));

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
    } else {
        product.quantity = product.quantity || 1;
        cart.push(product);
    }
    
    saveCart();
    updateCartCount();
    updateCartPage();
    showFeedback('Item added to cart!', 'success');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    updateCartPage();
}

function updateQuantity(index, newQuantity) {
    if (newQuantity > 0) {
        cart[index].quantity = newQuantity;
    } else {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartCount();
    updateCartPage();
}

function calculateTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    let discount = 0;
    let total = subtotal;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discount = subtotal * (appliedCoupon.discount / 100);
        } else {
            discount = appliedCoupon.discount;
        }
        discount = Math.min(discount, subtotal);
        total = subtotal - discount;
    }
    
    return { subtotal, discount, total };
}

function updateCartPage() {
    const cartPage = document.querySelector('.ListCart');
    const subtotalElement = document.querySelector('#subtotal table tr:nth-child(1) td:nth-child(2)');
    const totalElement = document.querySelector('#subtotal table tr:nth-child(3) td:nth-child(2)');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    
    if (cartPage) {
        cartPage.innerHTML = '';
        
        const { subtotal, discount, total } = calculateTotals();
        
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'table-row';
            if (subtotalElement) subtotalElement.textContent = '0.00 Dhs';
            if (totalElement) totalElement.innerHTML = '<strong>0.00 Dhs</strong>';
            appliedCoupon = null;
            const discountRow = document.querySelector('#subtotal table tr.discount-row');
            if (discountRow) discountRow.remove();
            return;
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        }
        
        cart.forEach((item, index) => {
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            
            const row = document.createElement('tr');
            row.className = 'item';
            row.innerHTML = `
                <td class="remove"><a href="#" data-index="${index}"><i class="fas fa-trash-alt"></i></a></td>
                <td class="image"><img src="${item.image}" alt="${item.name}" width="70"></td>
                <td class="name">${item.name} ${item.size ? `(${item.size})` : ''}</td>
                <td class="price">${item.price.toFixed(2)} Dhs</td>
                <td class="quantity"><input type="number" value="${quantity}" min="1" data-index="${index}"></td>
                <td class="totalprice">${itemTotal.toFixed(2)} Dhs</td>
            `;
            cartPage.appendChild(row);
        });
        
        if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)} Dhs`;
        if (totalElement) totalElement.innerHTML = `<strong>${total.toFixed(2)} Dhs</strong>`;
        
        const subtotalTable = document.querySelector('#subtotal table');
        const shippingRow = document.querySelector('#subtotal table tr:nth-child(2)');
        
        const existingDiscountRow = document.querySelector('#subtotal table tr.discount-row');
        if (existingDiscountRow) {
            existingDiscountRow.remove();
        }
        
        if (appliedCoupon) {
            const discountRow = document.createElement('tr');
            discountRow.className = 'discount-row';
            discountRow.innerHTML = `
                <td>Discount (${appliedCoupon.code})</td>
                <td class="discount-value">-${discount.toFixed(2)} Dhs</td>
            `;
            subtotalTable.insertBefore(discountRow, shippingRow.nextSibling);
        }
        
        document.querySelectorAll('.remove a').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(button.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
        
        document.querySelectorAll('.quantity input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(input.getAttribute('data-index'));
                const newQuantity = parseInt(input.value);
                updateQuantity(index, newQuantity);
            });
        });
    }
}

function showAvailableCoupons() {
    const couponContainer = document.createElement('div');
    couponContainer.className = 'coupon-container';
    couponContainer.innerHTML = `
        <div class="coupon-modal">
            <div class="coupon-header">
                <h3>Available Coupons</h3>
                <span class="close-coupons">&times;</span>
            </div>
            <div class="coupon-list">
                ${coupons.map(coupon => `
                    <div class="coupon-item">
                        <div class="coupon-info">
                            <strong>${coupon.code}</strong>
                            <p>${coupon.description}</p>
                        </div>
                        <button class="apply-coupon" data-code="${coupon.code}">Apply</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(couponContainer);
    

    couponContainer.querySelector('.close-coupons').addEventListener('click', () => {
        document.body.removeChild(couponContainer);
    });
    
    
    couponContainer.querySelectorAll('.apply-coupon').forEach(button => {
        button.addEventListener('click', () => {
            const couponCode = button.getAttribute('data-code');
            document.querySelector('#coupon input').value = couponCode;
            document.body.removeChild(couponContainer);
            document.querySelector('#coupon button.normal').click();
        });
    });
    
    
    couponContainer.addEventListener('click', (e) => {
        if (e.target === couponContainer) {
            document.body.removeChild(couponContainer);
        }
    });
}

function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateCartPage();
    
    
    const showCouponsBtn = document.createElement('button');
    showCouponsBtn.className = 'normal';
    showCouponsBtn.textContent = 'View Available Coupons';
    showCouponsBtn.style.marginTop = '10px';
    showCouponsBtn.addEventListener('click', showAvailableCoupons);
    
    const couponDiv = document.querySelector('#coupon');
    if (couponDiv) {
        couponDiv.appendChild(showCouponsBtn);
    }
    
    
    document.querySelectorAll('.pro a i.fal.fa-shopping-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productElement = button.closest('.pro');
            const product = {
                name: productElement.querySelector('.des h5').textContent,
                price: parseFloat(productElement.querySelector('.des h4').textContent.replace(' Dhs', '')),
                image: productElement.querySelector('img').src,
                quantity: 1
            };
            addToCart(product);
            
            button.style.backgroundColor = '#088178';
            button.style.color = '#fff';
            setTimeout(() => {
                button.style.backgroundColor = '#e8f6ea';
                button.style.color = '#088178';
            }, 500);
        });
    });
    
    
    const detailAddToCart = document.querySelector('.single-pro-details button.normal');
    if (detailAddToCart) {
        detailAddToCart.addEventListener('click', () => {
            const product = {
                name: document.querySelector('.single-pro-details h4').textContent,
                price: parseFloat(document.querySelector('.single-pro-details h2').textContent.replace(' Dhs', '')),
                image: document.getElementById('MainImg').src,
                quantity: parseInt(document.querySelector('.single-pro-details input[type="number"]').value) || 1,
                size: document.querySelector('.single-pro-details select')?.value
            };
            addToCart(product);
            
            detailAddToCart.textContent = 'Added to Cart!';
            detailAddToCart.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                detailAddToCart.textContent = 'Add To Cart';
                detailAddToCart.style.backgroundColor = '#088178';
            }, 1500);
        });
    }
    
    
    const checkoutButton = document.querySelector('#subtotal button.normal');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                showFeedback('Your cart is empty!', 'error');
                return;
            }
            const { total } = calculateTotals();
            showFeedback(`Proceeding to checkout! Total: ${total.toFixed(2)} Dhs`, 'success');
        });
    }
    
    
    const couponButton = document.querySelector('#coupon button.normal');
    if (couponButton) {
        couponButton.addEventListener('click', () => {
            const couponCode = document.querySelector('#coupon input').value.trim();
            
            if (!couponCode) {
                showFeedback('Please enter a coupon code', 'error');
                return;
            }

            if (cart.length === 0) {
                showFeedback('Your cart is empty! Add items to apply a coupon.', 'error');
                return;
            }

            const coupon = coupons.find(c => c.code === couponCode.toUpperCase());
            
            if (!coupon) {
                showFeedback('Invalid coupon code', 'error');
                return;
            }

            appliedCoupon = coupon;
            updateCartPage();
            showFeedback(`Coupon "${coupon.code}" applied successfully!`, 'success');
        });
    }
});


var MainImg = document.getElementById("MainImg");
var smallimg = document.getElementsByClassName("small-img");

if (MainImg && smallimg.length > 0) {
    for (let i = 0; i < smallimg.length; i++) {
        smallimg[i].onclick = function() {
            MainImg.src = smallimg[i].src;
        }
    }
}




function openCheckout() {
    if (cart.length === 0) {
        showFeedback('Your cart is empty!', 'error');
        return;
    }

    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
 
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('.checkout-step[data-step="1"]').classList.add('active');
    
    
    updateOrderSummary();
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateOrderSummary() {
    const { subtotal, discount, total } = calculateTotals();
    const summaryItems = document.querySelector('.summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryDiscount = document.getElementById('summary-discount');
    const summaryTotal = document.getElementById('summary-total');
    const discountRow = document.getElementById('summary-discount-row');
    
    summaryItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="summary-item-info">
                <h4>${item.name}</h4>
                <p>${item.quantity || 1} × ${item.price.toFixed(2)} Dhs</p>
            </div>
            <div class="summary-item-price">
                ${(item.price * (item.quantity || 1)).toFixed(2)} Dhs
            </div>
        `;
        summaryItems.appendChild(itemElement);
    });
    
    summarySubtotal.textContent = `${subtotal.toFixed(2)} Dhs`;
    summaryTotal.textContent = `${total.toFixed(2)} Dhs`;
    
    if (appliedCoupon) {
        discountRow.style.display = 'flex';
        summaryDiscount.textContent = `-${discount.toFixed(2)} Dhs`;
    } else {
        discountRow.style.display = 'none';
    }
}

function goToStep(nextStep) {
    const currentStep = document.querySelector('.checkout-step.active');
    const newStep = document.querySelector(`.checkout-step[data-step="${nextStep}"]`);
    
    
    if (currentStep.dataset.step === "1") {
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        if (!email || !phone) {
            showFeedback('Please fill in all required fields', 'error');
            return;
        }
    } else if (currentStep.dataset.step === "2") {
        const fullName = document.getElementById('full-name').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postal-code').value;
        
        if (!fullName || !address || !city || !postalCode) {
            showFeedback('Please fill in all required fields', 'error');
            return;
        }
    }
    
    currentStep.classList.remove('active');
    newStep.classList.add('active');
}

function placeOrder() {
    const { total } = calculateTotals();
    const email = document.getElementById('email').value;
    const paymentMethod = document.querySelector('.payment-method.active').dataset.method;
    
   
    const orderNumber = '#' + Math.floor(10000 + Math.random() * 90000);
    
    
    document.querySelector('.checkout-step[data-step="3"]').classList.remove('active');
    document.querySelector('.checkout-step[data-step="4"]').classList.add('active');
    
    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('confirmation-email').textContent = email;
    
    
    cart = [];
    saveCart();
    updateCartCount();
    updateCartPage();
    
    
    setTimeout(() => {
        showFeedback(`Order placed successfully! Paid ${total.toFixed(2)} Dhs via ${paymentMethod}`, 'success');
    }, 500);
}


document.addEventListener('DOMContentLoaded', () => {
    
   
    const checkoutButton = document.querySelector('#subtotal button.normal');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', openCheckout);
    }
    
    
    document.querySelectorAll('.close-checkout').forEach(btn => {
        btn.addEventListener('click', closeCheckout);
    });
    
    
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentStep = e.target.closest('.checkout-step');
            const nextStep = parseInt(currentStep.dataset.step) + 1;
            goToStep(nextStep);
        });
    });
    

    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentStep = e.target.closest('.checkout-step');
            const prevStep = parseInt(currentStep.dataset.step) - 1;
            goToStep(prevStep);
        });
    });
    
    
    const placeOrderBtn = document.querySelector('.place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
    
    
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('active');
            });
            method.classList.add('active');
            
            
            document.querySelectorAll('.payment-details').forEach(details => {
                details.style.display = 'none';
            });
            const methodName = method.dataset.method;
            document.getElementById(`${methodName}-details`).style.display = 'block';
        });
    });
});
