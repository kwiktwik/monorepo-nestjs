<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/check-cred-eligibility -->

You can use the API given below to determine if the user is eligible for CRED Pay transactions on Custom Checkout.

**Watch Out!**

You should provide the user's contact number with the country code to check the eligibility.

Following is the sample code for request and response.

RequestResponse

copy

```javascript
var razorpay = new Razorpay({
  key: '<YOUR_API_KEY>',
});
razorpay.checkCREDEligibility("+918888888888")
  .then((response) => {

    // Contact is CRED Eligible 

  })
  .catch((error) => {
    // Contact is  CRED Ineligible 
  });
```
