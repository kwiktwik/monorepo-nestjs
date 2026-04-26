<!-- Source: https://razorpay.com/docs/payments/smart-collect/va-vpa-qr/api/create -->

You can create a new virtual bank account, virtual UPI ID or QR code using this API. You can choose to link it to a specific customer.

**Note**

Currently, we support creation of virtual UPI IDs in the live mode only. However, virtual bank accounts can be created in the test and live modes.

## Request Parameters

**Custom Descriptor**

You can customize the descriptor of the vpa as per your business requirements. This is an on-demand feature and is not available by default. To enable creation of custom descriptors, raise a request on our [Support Portal](https://razorpay.com/support/#request).

receivers

mandatory

`json object` Configuration of desired receivers for the virtual account.

types

`array` List of desired receiver types. Possible values are:
 - `bank_account`
 - `vpa`
 - `qr_code`

vpa

optional

`json object` Descriptor details for the virtual UPI ID. This is to be passed only when `vpa` is passed as the receiver `types`.

descriptor

`string` You can provide a custom descriptor for the UPI ID. This is a unique identifier provided by you to identify the customer. For example, `gaurikumari` and `akashkumar` are the descriptors in the usernames `rpy.payto00000gaurikumari` and `rpy.payto00000akashkumar` respectively. The combination of merchant prefix and descriptor must be 20 characters. The length of the merchant prefix can vary between 4-10 characters, and the length of descriptor from 10-16 characters.

description

optional

`string` A brief description of the virtual account.

customer\_id

optional

`string` Unique identifier of the customer to whom the virtual account must be tagged. Refer to the [Customer API](/razorpay-docs-md/api/customers.md) documentation to learn how to create a customer.

notes

optional

`json object` Any custom notes you might want to add to the virtual account can be entered here. Refer to the [Notes section of the API Reference Guide](/razorpay-docs-md/api/understand.md#notes) to learn more.

close\_by

optional

`integer` UNIX timestamp at which the virtual account is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Note**

:
Any request beyond `2147483647` UNIX timestamp will fail.

**Note**

While sharing the details of VAs (created using RBL bank) with the customers, ensure that the fifth character in the IFSC is number `0` and not the letter O. For example, valid IFSC is `RATN0VAAPIS` and not `RATNOVAAPIS`.

Here is a sample request and response which can be used to create a virtual account with all the receiver types `bank_account`, `vpa` and `qr_code`.
