<!-- Source: https://razorpay.com/docs/payments/smart-collect/va-vpa-qr/api/postman-collection -->

We have a Postman collection to make the integration quicker and easier. Click the **Download Postman Collection** button below to get started. [Download Postman Collection](https://app.getpostman.com/run-collection/d2d3a71a2cf38a0792c0)

## Instructions to Use Postman Collection

- All Razorpay APIs are authenticated using Basic Authentication.
  - [Generate API Keys from the Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)

    .
- Add your API Keys in Postman. Selected the required API → Auth → Type = Basic Auth → Username = [Your\_Key\_ID]; Password = [Your\_Key\_secret]

  ![](https://razorpay.com/docs/payments/smart-collect/va-vpa-qr/api/build/browser/assets/images/api-postman_basic_auth.gif)
- Some APIs in the collection require data specific to your account either in the request body or as path parameters.
  - For example, the Fetch a Customer Identifier by ID API requires you to add the `va_id` as a path parameter in the endpoint.
  - These parameters are enclosed in {} in the collection. For example, {va\_id}.
  - The API throws an error if this value is incorrect or does not exist in your system.
