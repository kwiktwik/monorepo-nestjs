<!-- Source: https://developer.phonepe.com/offline-integration/dynamic-qr-solution/introduction -->

# Dynamic QR Code Solution

---

Dynamic QR is a QR-code based payment solution that works on systems where a digital device can create a QR code dynamically, by taking in parameters of that particular order/transaction. For ex., when a food delivery boy wants to accept a PhonePe payment from a customer at the time of delivery, the delivery boy’s app will generate a QR (by talking to PhonePe’s systems) that is unique to that particular order, and the customer can scan and pay against that QR code. For every order, the QR code generated will be different.

## Difference between Static and Dynamic QR

Static QR codes, QR codes widely used in everyday offline shops today, are QR codes that do not change per order. They are fixed per store, and typically identify one or more of:

- Merchant
- Outlet/Franchise
- The billing terminal, if there are more than one terminals in the store.

So, for any order placed in a particular outlet, all the customers will scan the same QR code, and the QR is not unique per order.

|  |  |  |
| --- | --- | --- |
|  | Static QR | Dynamic QR |
| *`Amount Entered By`* | Customer enters after scanning the QR | Merchant. Dynamic QR contains the amount information (captured at the time of creation, details below) |
| *`Unique Per Transaction`* | No | Yes |
| *`Generation Time`* | During merchant on-boarding, once per merchant. | Generated at runtime by the system. For every order, the merchant system calls PhonePe APIs and a new QR string is generated. |
| *`Display Method`* | Standees, Stuck to tables near billing terminals etc. | Displayed to the end consumer on the digital device (such as an app on the mobile phone) of the merchant. |
| *`Internet Requirement`* | Customer needs internet to complete the payment, merchant need not have internet. | Both Customer and merchant require internet to complete the transaction. |

## Merchant Requirements

Any merchant who has:

- Internet
- A display that he can show to the consumer for the consumer to scan the QR can use the dynamic QR code solution.

This is an integrated solution, which means that PhonePe will give the status of the transaction to the merchant’s Billing systems for the merchant to generate the bill.

## POS Based Solutions

These solutions can be merged with your point-of-sale systems for easy record-keeping and management. Such a set-up is ideal for stores with high-volume sales, be it local shops or bigger stores.

## Dynamic QR

We can generate a QR for you which is integrated with your POS system. When the customers scan and pay, the records are captured in your system.
