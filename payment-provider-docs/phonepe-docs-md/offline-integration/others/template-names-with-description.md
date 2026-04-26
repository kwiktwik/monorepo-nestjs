<!-- Source: https://developer.phonepe.com/offline-integration/others/template-names-with-description -->

# Template Names with Description

Below are the templates names which are supported on the UAT Simulator application and needs to be configured at the MID level before hitting any of the Phonepe integrated API. Follow the steps on how to configure & test a required template on the Simulator app using the link below

---

Steps for Templates Configuration on the Simulator app: [link](/phonepe-docs-md/offline-integration/others/getting-started-with-your-api.md)

## DQR testing templates:

1. **DQR Intent Success with refund with bank details (Primary) :** This Template works to generate the Dynamic QR on the UAT env, checks the payment responses using Check Status API and refund the paid amount using phonepe Refund API. This template is bundled with DQR API, Status Check API or Callback API and Refund API.
2. **DQR payment with cancel:** This template helps you to generate Dynamic QR and cancel the generated DQR by hitting our cancel API. You can also hit Check Status API to know the cancelled status. This template is bundled with DQR init API, Cancel API, Status Check API.
3. **DQR Intent Success with refund:** This Template works to generate the Dynamic QR on the UAT env, sends the payment responses using Check Status API and Callback API
4. **DQR Intent Success with refund with bank details with merchant order ID:**This Template works to generate the Dynamic QR on the UAT, checks the payment responses using Check Status API/ Callback API and refund the paid amount using our Refund API. It also gives MerchantOrderID in the Callback response.
5. **DQR Payment Intent Success with Failure Callback**: This Template works to generate the Dynamic QR on the UAT env and gives the failed payment response through Status Check API or Callback API. This template is bundled with DQR init, Status Check API, Callback API. ( Remember to pass X-Callback-Url in your request header at the time of DQR init request)

## Collect Call templates:

1. **Charge Intent Success with refund with bank details (Primary) :** This Template works to send Collect Call push on the UAT Simulator app, user can perform the transaction through the Simulator app and gets the payment confirmation through Check Status API or Callback API. User could also get the refund for paid amount using our Refund API. This template is bundled with Collect Call API, Status Check API, Callback API and Refund API.
2. **Charge Intent Success with Cancel Api Success:** This template helps user to generate Collect Call push on the UAT Simulator app and cancel the generated Collect Call request by hitting the cancel API. User can also get the cancelled status by hitting Check Status API.
3. **Charge payment pending state:** This template helps user to generate Collect Call push request on the Simulator app but payments will not go through the Simulator application. This is Payment\_Pending state template.

## Static QR templates:

1. **SQR Intent Success:** This template help user to scan the UAT static QR shared over mail for testing purpose. Before scanning the Static QR through Simulator application, please make sure that the template is properly configured (set) at the UAT Merchant-ID level. The steps on how to configure a template is given on this [link](/phonepe-docs-md/offline-integration/others/getting-started-with-your-api.md)

## Paylink API templates:

1. **Paylink Success with Payment Status and Refund with Bank Details:**This template help user to generate a payment link ( called Paylink ), open the paylink using Simulator app and it will take you to the payment page. After the transaction completed, user can get the transaction status using Check Status API or Callback API. User will also get the refund for paid amount using our Refund API. This template is bundled with Paylink API, Status Check API, Callback API and Refund API.
2. **Paylink Success with Cancel API:** This template help user to generate a payment link ( called Paylink ), open the paylink using the Simulator app and cancel the generated paylink by hitting our cancel API. User can also get the cancelled status by hitting Check Status API.
3. **Paylink Success with Refund:** This template help user to generate a payment link ( called paylink ), open the paylink using Simulator app and proceed to the payment page. User can get the transaction status using Check Status API or Callback API. User will also get the refund for paid amount using our Refund API. This template is bundled with Paylink API, Status Check API, Callback API and Refund API.
4. **Paylink Payment Pending State:** This template help user to generate a payment link ( called paylink ), open the paylink using Simulator app but it won’t proceed to the payment page by throwing error. Hence the Check Status API shows Payment\_Pending status.
