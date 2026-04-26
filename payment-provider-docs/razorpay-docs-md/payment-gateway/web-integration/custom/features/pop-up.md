<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/pop-up -->

You can bring a pop-up on the screen by calling the `focus` method. This helps as a visual reminder to the customer that the payment is ongoing.

#### Sample Code

html

copy

```html
<script>
var rp = new Razorpay(..);
...
</script>

// after some time
<span>Processing Payment...</span>
<button>Take me back to payment</button>
<script>
  $('button').click(function(){
    rp.focus(); // will bring popup to top
  })
</script>
```
