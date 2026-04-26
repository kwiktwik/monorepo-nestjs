<!-- Source: https://razorpay.com/docs/payments/server-integration/nodejs/troubleshooting-faqs -->

1. I have configured the payment method. But, I still see the following error message, `payment method is not configured`. How do I fix this?

This error may also appear if the API key ID is not added to the checkout code. Check and add the API key ID.

2. I got an error saying `id is not valid`. Which id do I look for?

If the order id is not replaced in the checkout code, the `id is not valid` error appears. Replace the order id.

The `order_id` is available in following code:

Handler Function (JS) Checkout CodeCallback URL (JS) Checkout Code

copy

```html
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits.
    "currency": "",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": "order_IluGWxBm9U8zJ8", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response){
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
    },
    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "+919876543210"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
var rzp1 = new Razorpay(options);
rzp1.on('payment.failed', function (response){
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
});
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

3. Can I integrate Razorpay Checkout with React.js?

Yes, you can integrate the Razorpay Payment Gateway with React.js. Follow the [Node.js integration steps](/razorpay-docs-md/server-integration/nodejs/integration-steps.md) and to add a pay button use the React.js sample code given below:

React.js

copy

```javascript
import logo from './logo.svg';
import './App.css';

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

function App() {

async function displayRazorpay () {

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

      if (!res){
        alert('Razropay failed to load!!')
        return 
      }

      const data = await fetch('http://localhost:1769/razorpay', {method: 'POST'}).then((t) => 
        t.json()
      ) 

      console.log(data)

    const options = {
      "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
      "amount": "50000", // Amount is in currency subunits. 
      "currency": "",
      "name": "Acme Corp",
      "description": "Test Transaction",
      "image": "https://example.com/your_logo",
      "order_id": "order_IluGWxBm9U8zJ8", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "callback_url":"http://localhost:1769/verify",
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
  };
  const paymentObject = new window.Razorpay(options); 
  paymentObject.open();
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />   
        <button
        onClick={displayRazorpay}
        >
          Pay now 
        </button>
      </header>
    </div>
  );
}

export default App;
```

4. While installing the SDK, I encountered an error "Please verify that the package.json has a valid main entry." How do I fix this?

This error may occur due to the installation process. Try re-installing npm by deleting the node modules folder and running `npm i`.
