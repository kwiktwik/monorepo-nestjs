<!-- Source: https://razorpay.com/docs/payments/recurring-payments/batch-operations -->

You can [create registration links](/razorpay-docs-md/recurring-payments/batch-operations.md#create-registration-links) and [charge tokens](/razorpay-docs-md/recurring-payments/batch-operations.md#charge-tokens) in bulk using the batch feature available from the Dashboard. You can check the status of the bulk action in the respective batch reports.

## Batch Statuses

The following table lists the various states of a batch file:

## Create Registration Links

You can create registration links in bulk using the Batch Upload feature.

**Handy Tips**

- You can upload batch files in either in the `.xlsx` or the `.csv` format.
- The maximum file size is 55MB and 5,00,000 rows.
- Ensure you enter the amount in paise. For example, if the amount is ₹1,000, you should enter the value as `100000`.
- The links are processed in the same sequence as listed in the file.
- **Do not modify the column headers**. Modifying the column headers causes the batch upload to fail.

To create a registration link:

1. Log in to the Dashboard.
2. Under **PAYMENT PRODUCTS**, navigate to **Subscriptions** → **Batch Upload** → **Upload New Batch** → **Batch Registration Links**.
3. Download the [sample file](/razorpay-docs-md/recurring-payments/build/browser/assets/images/sample_authorization_links.md)   .
4. Add the required data. Know more about the Batch Fields from the [below table](/razorpay-docs-md/recurring-payments/batch-operations.md#batch-fields)   .
5. Upload the file to the Dashboard.
6. Select the relevant notification options, SMS and/or Email.
7. Click **Create**.

Watch this video to know how to create registration links using the batch feature from the Dashboard.

### Batch Fields

The following table lists the fields required to create a registration link:

name

optional

The customer's name. For example, `Gaurav Kumar`.

email

mandatory

The customer's email address. For example, `gaurav.kumar@example.com`.

phone

mandatory

The customer's contact number. For example, `9876543210`.

amount

mandatory if method = card/upi

The registration amount you want to charge the customer in paise.

- For **Card**, the minimum value is 100 (that is ₹1).
- For **Emandate and NACH**, the authorization value is 0.

  **Auto-charge First Payment**

  You can choose to auto-charge the customer an initial payment immediately after authorisation by entering any value greater than 0. For example, if you enter 100000, the customer is auto-charged ₹1,000 as soon as the token is confirmed.
- For **UPI**, the minimum value is 100 (that is ₹1).

currency

mandatory if amount is provided

The 3-letter ISO currency code for the payment. Currently, only `INR` is allowed.

method

mandatory

The payment method to be authorized. This can be:

- `emandate`
- `card`
- `nach`
- `upi`

token\_expiry\_by

optional

The date and time of expiry for a mandate.
Minimum value is 1 day. Defaults to `30 years` for Emandate and UPI. The maximum value you can set is `30 years` from the current date. Any value beyond this will throw an error. Supported formats:

- DD/MM/YYYY HH:mm:ss (For example, 31/12/2019 00:59:59)
- DD/MM/YYYY HH:mm
- DD/MM/YYYY

token\_max\_amount

optional

`Emandate, NACH and UPI only`. Maximum amount for the token (in paise).

- For emandate:
  - Default value is `9999900` (₹99,999).
  - Minimum value is `500` (₹5).
  - Maximum value is is `1000000000` (₹1,00,00,000).
- For Paper NACH:
  - Default value is `10000000` (₹1 lac).
  - Minimum value is `500` (₹5).
  - Maximum value is `1000000000` (₹1 cr).
- For UPI:
  - Default value is `500000` (₹5,000).
  - Minimum value is `100` (₹1).
  - Maximum value is `500000` (₹5,000).

frequency

mandatory if method = upi

The frequency at which you can charge your customer. Possible values:

- `daily`
- `weekly`
- `monthly`
- `quarterly`
- `yearly`
- `fortnightly`
- `bimonthly`
- `half_yearly`
- `as_presented`

auth\_type

mandatory if mehtod =emandate and nach

`Emandate, UPI and NACH only`. The payment authorisation type. Possible values:

- `netbanking` or `debitcard` for emandate. Leave this blank if you want to allow the customer to select their preferred option when making the payment.
- `physical` for NACH.

bank

mandatory if method = nach

`Emandate and NACH only`. Bank code to preselect a bank. For example, `HDFC`.
You can fetch bank codes by firing the following API as a GET request:
`https://<YOUR_KEY_ID>@api.razorpay.com/v1/methods`.

account\_holder\_name

mandatory if method = nach and upi

`Emandate, UPI and NACH only`. Name of the account holder. For example, `Gaurav Kumar`. This field is mandatory for the UPI method only if you have enabled the TPV functionality. Please contact our [Support team](https://razorpay.com/support/#request) to enable TPV on your Razorpay account.

ifsc

mandatory if method = emandate, nach and upi

`Emandate, UPI and NACH only`. The bank's IFSC. For example, `HDFC0001234`. This field is mandatory for the UPI method only if you have enabled the TPV functionality. Please contact our [Support team](https://razorpay.com/support/#request) to enable TPV on your Razorpay account.

account\_number

mandatory if method = emandate, nach and upi

`Emandate, UPI and NACH only`. Customer's bank account number. For example, `11214311215411`. This field is mandatory for the UPI method only if you have enabled the TPV functionality. Please contact our [Support team](https://razorpay.com/support/#request) to enable TPV on your Razorpay account.

account\_type

mandatory if method = emandate, nach and upi

`Emandate, UPI and NACH only`. Bank account type. This field is mandatory for the UPI method only if you have enabled the TPV functionality. Please contact our [Support team](https://razorpay.com/support/#request) to enable TPV on your Razorpay account. Possible values:

- `savings`
- `current`

receipt

optional

A user-entered unique identifier for the order. For example, `Receipt No. 1`. This parameter should be mapped to the `order_id` sent by Razorpay.

description

mandatory

A user-entered description for the registration link. For example, `12 p.m. Meals`.

link\_expiry\_by

optional

Date and time of expiry for the registration link. Supported format DD/MM/YYYY. For example, `17/12/2020`.

notes[custom 1]

optional

Key-value pair that can be used to store additional information about the entity. You can add up to 5 custom notes in the following format:

- notes[portfolio id]
- notes[transaction id]

**Bank Details**

For Emandate, you should provide all the required bank details or leave all the fields blank. Following are the required bank details:

- `bank`
- `account_holder_name`
- `ifsc`
- `account_number`
- `account_type`

If you enter details for a few fields and leave the other blank, will lead to failure.

### Batch Report

After a batch file is processed, you can download the batch report from the Dashboard. Click the **batch\_id** to view details of how many rows were uploaded, how many rows were processed successfully and how many rows failed.

![](https://razorpay.com/docs/payments/recurring-payments/build/browser/assets/images/recurring-payments-view_batch_link_report_dashboard.jpg)

Click **Download Report** to download the report. This report has the following additional fields that give you information about the authorisation link or the reason for failure.

Status

The status of the authorisation link. Possible values:

- `success`
- `failed`

authorization\_link\_id

The unique identifier for the authorisation link. For example, `inv_E7vb0PqKa4VpBc`.

authorization\_link

The short URL for the authorisation link. For example, `https://rzp.io/i/Abcd5`.

link\_status

The status of the authorisation link. For example, `issued`.

created\_at

Timestamp, in Unix format, when the authorisation link was created. For example, `1580134092`.

Error Code

The error code for the failure. For example, `BAD_REQUEST_ERROR`.

Error Description

The reason for the error. For example:

- `Bank code provided is invalid.`
- `expire_by should be at least 15 minutes after current time`
- `The ifsc code field is required.`

## Charge Tokens

To charge tokens using the batch upload feature, you will first need the list of [Tokens](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) for which recurring payments are to be created.

**Handy Tips**

- You can upload batch files in either in the `.xlsx` or the `.csv` format.
- The maximum file size is 55MB and 5,00,000 rows.
- Ensure you enter the amount in paise. For example, if the amount is ₹1,000, you should enter the value as `100000`.
- The links are processed in the same sequence as listed in the file.
- **Do not modify the column headers**. Modifying the column headers causes the batch upload to fail.

Once you have the list of tokens you can either:

- [Charge the tokens immediately](/razorpay-docs-md/recurring-payments/batch-operations.md#charge-tokens-immediately)

  .
- [Schedule a charge on the tokens at a later time](/razorpay-docs-md/recurring-payments/batch-operations.md#schedule-a-charge-on-tokens)

  .

### Charge Tokens Immediately

Watch this video to know how to charge tokens immediately from the Dashboard using the batch feature.

To charge tokens immediately:

1. Log in to Dashboard.
2. Under **PAYMENT PRODUCTS**, navigate to **Subscriptions** → **Batch Upload** → **Upload New Batch** → **Batch Recurring Payments**.
3. Download the [sample file](https://cdn.razorpay.com/dashboard/sample_recurring_payments.csv)   .
4. Add the required data. Know more about the Batch Fields from the [below table](/razorpay-docs-md/recurring-payments/batch-operations.md#charge-token-batch-fields)   .
5. Upload the file to the Dashboard.
6. Select **Process Now**.
7. Click **Create**.

### Schedule a Charge on Tokens

You can schedule to charge tokens in bulk.

Watch this video to know how to schedule a charge on tokens from the Dashboard using the bulk upload feature.

To schedule to charge tokens:

1. Log in to Dashboard.
2. Under **PAYMENT PRODUCTS**, navigate to **Subscriptions** → **Batch Upload** → **Upload New Batch** → **Batch Recurring Payments**.
3. Download the [sample file](https://cdn.razorpay.com/dashboard/sample_recurring_payments.csv)   .
4. Add the required data. Know more about the Batch Fields from the [below table](/razorpay-docs-md/recurring-payments/batch-operations.md#charge-token-batch-fields)   .
5. Upload the file to the Dashboard.
6. Select **Schedule for Later** and select the date and time you want to charge the tokens. The schedule time should be at least 1 hour from the current time.
7. Click **Create**.

### Charge Token Batch Fields

The following table lists the fields required to charge a token:

token

mandatory

The unique identifier for the token. For example, `token_1Aa00000000001`.

customer\_id

mandatory

The unique identifier of the customer. For example, `cust_1Aa00000000001`.

amount

mandatory

The amount, in paise, you want to charge the customer. For example, enter `69999` for ₹699.99.

currency

mandatory

The 3-letter ISO currency code for the payment. Currently, only `INR` is allowed.

receipt

optional

A user-entered unique identifier for the order. For example, `Receipt No. 1`. This parameter should be mapped to the `order_id` sent by Razorpay.

description

optional

A user-entered description for the payment. For example, `12 p.m. Meals`.

notes[custom 1]

optional

Key-value pair that can be used to store additional information about the entity. You can add up to 5 custom notes in the following format:

- notes[portfolio id]
- notes[transaction id]

### Processed Batch Fields

Once a batch file is processed, you can download the processed file from the Dashboard. Click the `batch_id` to view details of how many rows were uploaded, how many rows were processed successfully and how many rows failed.

![](https://razorpay.com/docs/payments/recurring-payments/build/browser/assets/images/recurring-payments-view_batch_charge_report_dashboard.jpg)

Click `Download Report` to download the processed file. This file has the following additional fields that give you information about the authorization link or the reason for failure.

order\_id

The unique identifier linked to the order for the payment. For example, `order_E16Yt72tHs34li`.

payment\_id

The unique identifier for the payment. For example, `pay_E16YtBnEk38fAm`.

Error Code

The error code for the failure. For example, `BAD_REQUEST_ERROR`.

Error Description

The reason for the error. For example, `Payment amount exceeds the maximum amount allowed.`

### Related Information

- [Create Recurring Payments](/razorpay-docs-md/recurring-payments/create.md)
- [Paper NACH Form](/razorpay-docs-md/recurring-payments/upload-paper-nach-form.md)
