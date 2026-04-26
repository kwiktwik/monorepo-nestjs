<!-- Source: https://developer.phonepe.com/docs/settlements -->

# Settlements

Settlements of all transactions with the merchants is done on a t + 1(offline), t + 1(online) basis except on bank holidays(2nd and 4th Saturdays, Sundays and other government holidays). However, settlement cycle of a transaction is subject to change depending on type of transaction, merchant and business model. Please confirm your settlement cycle during commercial closure.

All payment transactions of a customer using PhonePe as well as refunds for these purchases post settlement are reflected in the settlement report. Net payment is transferred to merchant’s bank account after netting off commissions and refunds.

## Settlement report format

![](/static/3a88567d19ba5e596d73c01f6689e64a/58f13/settlement-report.png)![](/static/3a88567d19ba5e596d73c01f6689e64a/58f13/settlement-report.png)

![](/static/3a88567d19ba5e596d73c01f6689e64a/58f13/settlement-report.png)![](/static/3a88567d19ba5e596d73c01f6689e64a/58f13/settlement-report.png)

Settlement Report Fields

| Field Name | Description |
| --- | --- |
| `PaymentType` | `PAYMENT` or `REFUND` |
| `MerchantReferenceId` | ReferenceId given by the merchant for the txn |
| `PhonePeReferenceId` | PhonePe Transaction Id |
| `From` | From Party |
| `Instrument` | Instrument used for the transaction. Following are the various instruments available: • `AIRTEL_WALLET_REDEMPTION` • `AIRTEL_WALLET_REDEMPTION_REVERSE` • `EXTERNAL_VPA_REDEMPTION_REVERSE` • `EXTERNAL_VPA_REVERSE_YES_PAY` • `FREECHARGE_WALLET_REDEMPTION` • `FREECHARGE_WALLET_REDEMPTION_REVERSE` • `JIO_WALLET_REDEMPTION` • `JIO_WALLET_REDEMPTION_REVERSE` • `PG_REDEMPTION_CC` • `PG_REDEMPTION_DC` • `PG_REDEMPTION_REVERSE` • `PS_UPI_REDEMPTION_REVERSE` • `REVERSAL_OFFER_ADJUSTMENT` • `RGCS_UPI_REDEMPTION_REVERSE` • `UPI_REDEMPTION` • `WALLET_REDEMPTION` • `WALLET_REDEMPTION_REVERSE` • `INSTANT_REDEMPTION_REVERSE` • `EXCESS_RECOVERY` • `INVOICE_RECOVERY` • `SHORT_SETTLEMENT` |
| `CreationDate` | Date the transaction was created in PhonePe |
| `Amount` | Amount of the transaction in rupees(two decimals) |
| `Fee` | Fee charged by PhonePe in rupees |
| `TransactionDate` | Date of Transaction |
| `SettlementDate` | The date on which settlement is successfully reconciled in our accounting system. |
| `BankReferenceNo` | UTR |
| `IGST` | Integrated Goods and Service Tax |
| `CGST` | Central Goods and Service Tax |
| `SGST` | State Goods and Service Tax |

**Settled amount = `Amount` + `Fee` + `IGST` + `CGST` + `SGST`** (fees and taxes will be negative valued in the report)
