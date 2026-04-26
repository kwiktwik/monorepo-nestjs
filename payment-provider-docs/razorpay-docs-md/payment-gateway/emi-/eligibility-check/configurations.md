<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/eligibility-check/configurations -->

You can check eligibility for specific EMI² methods or instruments by passing the `instruments` array. If you do not pass the `instruments` array, the eligibility check is performed on all applicable EMI² instruments by **default**.

## Sample Code

Use the sample codes below to specify the methods or instruments of your choice:

### Check Eligibility on HDFC EMI

Use the code given below to check eligibility for HDFC EMI:

Code

copy

```java
{
  "instruments": [  // optional
    {
      "method": "emi",
      "issuers": [
        "HDFC"
      ],
      "types": [
        "debit" // only supports debit
      ]
    }
  ]
}
```

### Check Eligibility on a Specific Cardless EMI

Use the code given below to check eligibility on a specific Cardless EMI:

Code

copy

```java
{
  "instruments": [  // optional
    {
      "method": "cardless_emi",
      "providers": [
        "zestmoney"
      ]
    }
  ]
}
```

### Check Eligibility on Specific Cardless EMI and Pay Later Options

Use the code given below to check eligibility on specific Cardless EMI and Pay Later options:

Code

copy

```java
{
  "instruments": [ //optional
    {
      "method": "cardless_emi",
      "providers": [
        "walnut369"
      ]
    },
    {
      "method": "paylater",
      "providers": [
        "rzpx_postpaid",
        "getsimpl",
        "icic"
      ]
    }
  ]
}
```
