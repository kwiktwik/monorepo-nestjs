<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/postman-collection -->

We have a Postman collection to make the integration quicker and easier. Click the **Download Postman Collection** button below to get started. [Download Postman Collection](/razorpay-docs-md/api/payments/recurring-payments/build/browser/assets/images/recurring_postman.md)

## Instructions to Use Postman Collection

- All Razorpay APIs are authenticated using Basic Authentication.
  - [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

    from the Dashboard.
  - Add your API Keys in Postman. Select the required API → Auth → Type = Basic Auth → Username = [Your\_Key\_ID]; Password = [Your\_Key\_secret]

  ![](https://razorpay.com/docs/api/payments/recurring-payments/build/browser/assets/images/api-postman_basic_auth.gif)
- Some APIs in the collection require data specific to your account such as `order_id`, `cust_id` and `token_id` either in the request body or as a path parameter.
  - For example, the create order API requires you to add the `cust_id` (Customer ID) in the request body.
  - These parameters are enclosed in {} in the collection. For example, {cust\_id}.
  - The API throws an error if these are incorrect or do not exist in your system.
