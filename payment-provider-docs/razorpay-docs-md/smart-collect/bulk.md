<!-- Source: https://razorpay.com/docs/payments/smart-collect/bulk -->

Customer Identifiers can be created via batch. This may be necessary when you have a large number of customers to be onboarded simultaneously, and using the API would be unfeasible. Batch creation allows you to place all the information related to customer and Customer Identifier creation in a single file, ready for upload.

## Process

- Create a CSV, XLS or XLSX file containing all the required data to create Customer Identifiers. The format and sample row data are given in the following sections.
- Raise a request to process the file on the [support page](https://razorpay.com/support/#request)

  as an existing customer. Also share the 14-character Razorpay merchant Id in email body.
- Once we process the file on our side, we will share the same file with you with a few new columns appended per row. For every row, the status column will mention whether the Customer Identifier is active or not.
  - If the process is a success, the row will contain the Razorpay Customer ID, the Customer Identifier ID (a newly created Customer Identifier) and associated bank account details.
  - If there is a failure, subsequent columns will have an error description.

You may use this data for various operations on your end. All this information would also be available on your Dashboard as well as via API.

## Handle Errors

For rows that were not processed due to errors, create a new file with data corrected as per the error description. Send us the file again for processing. Do not include the error column in the new file.

## File Format And Data Constraints

- Provided file must be a valid CSV/XLS/XLSX
- Every row should contain values per the following format:

customer\_id

string

ID of an existing Razorpay customer. Can be used if it is not required to create a new customer.

customer\_name

string

Name of the customer. Can be used if a new customer is required to be created. Max length: 50

customer\_contact

string

Contact number of the customer. Can be used if a new customer is required to be created. Must be a valid contact number.

customer\_email

string

Email address of the customer. Can be used if a new customer is required to be created. Must be a valid email address.

virtual\_account\_descriptor

string

Used for custom account numbers. This is to be left blank as all account numbers are numeric by default.

virtual\_account\_description

string

Description for the Customer Identifier. Max length: 2048

virtual\_account\_notes

string

Notes field to be used while creating the Customer Identifier. Must be a valid JSON string.
Refer the [Notes](/razorpay-docs-md/api/understand.md#notes) section for more information.

Note that if `customer_id` field is being used, i.e. an existing customer is being referred to, then fields 2-4 can be left blank.

Sample rows in the file would look similar to the following:

csv

copy

```csv
cust_8gRzzeoemUfb5k,,,,,VA for Existing Customer,"{""key1"":""value1""}"
,Gaurav Kumar,9000090000,test@test.com,,VA for new customer,"{""key1"":""value1"",""key2"":""value2""}"
```

## Output File Format

customer\_id

string

ID of an existing, or a newly created customer.

customer\_name

string

Name of the customer.

customer\_contact

string

Contact number of the customer.

customer\_email

string

Email address of the customer.

virtual\_account\_id

string

ID of the newly created Customer Identifier.

bank\_account\_id

string

ID of the newly created bank account.

bank\_account\_name

string

Name associated with the newly created bank account.

bank\_account\_number

string

Account number of the newly created bank account.

bank\_account\_ifsc

string

IFSC of the newly created bank account.

Contact our [Support Team](https://www.razorpay.com/support) if you have any queries.
