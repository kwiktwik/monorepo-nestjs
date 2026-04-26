<!-- Source: https://razorpay.com/docs/payments/third-party-validation/troubleshooting-faqs -->

1. What is Third-Party Validation (TPV)?

Third-Party Validation (TPV) of bank accounts is a mandatory requirement for merchants in securities, broking and mutual funds operating in the BFSI (Banking, Financial Services and Insurance) sector.

As per Securities and Exchange Board of India (SEBI) guidelines, transactions must be made by the customers only from those bank accounts that were submitted to your business at the time of registration.

2. What can cause an overflow issue on an HTML page, and how can I resolve it?

Overflow issues can occur if the viewport meta tag is not present in your code. Check if the meta tag is added. If not, add the following line.

View Port Meta Tag

copy

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
```

3. Is a timeout applicable on transactions?

Transaction timeout is applicable only when your customer attempts the payment. It times out between 3 to 15 minutes.

The customer is redirected to the checkout if a payment fails due to timeout.

4. Can I track the status of the checkout modal?

Yes, you can track the status of the checkout modal. You can do this by passing a modal object with `ondismiss: function(){}` as `options`. The `ondismiss` function is called when the modal is closed by the user.

Javascript

copy

```javascript
var options = {
           "key": "<YOUR_KEY_ID>", // Enter the Key ID generated from the Dashboard
           "amount": "29935",
           "name": "Acme Corp",
           "description": "A Wild Sheep Chase is the third novel by Japanese author Haruki Murakami",
           "order_id": "order_Dd3Wbag7QXDuuL",
           "image": "http://example.com/your_logo.jpg",
           "handler": function (response){
               alert(response.razorpay_payment_id);
},
           /**
* You can track the modal lifecycle by * adding the below code in your options
*/
           "modal": {
               "ondismiss": function(){
                   console.log('Checkout form closed');
}
}
};
       var rzp1 = new Razorpay(options);
```

You can utilise the `handler` function called on every successful transaction for tracking payment completion.

5. What is the difference between webhooks and callback URLs?

You can use the Callback URL and webhook to get the status of the transaction for a payment source.

6. How do I resolve a 500 internal server error?

Multiple factors can cause a 500 internal server error. Ensure that the required features are enabled on your MID. Additionally, verify that you are calling the API correctly. If the issue is still not resolved, contact our [Support team.](https://razorpay.com/support/#request)
