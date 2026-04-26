<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/token-lifecycle -->

There are two types of tokens - service provider token and overall token.

**Handy Tips**

- Status will be available for the service provider token and the overall token entity.
- The status of overall token entity is derived from the individual service provider tokens.
- You may choose to consume one of them based upon your integration.

Given below is a diagram representing the token lifecycle:

![Token Lifecycle](https://razorpay.com/docs/payments/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/build/browser/assets/images/cards-token-hq-token-lifecycle.jpg)

## Token States for Service Provider Token

A service provider token will not have the `initiated` state. This is because the service provider token is created only when a token is successfully created.

## Overall Token States

A token can have following statuses:
