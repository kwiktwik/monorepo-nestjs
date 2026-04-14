<!-- Source: https://developer.phonepe.com/payment-gateway/error-codes -->

# Errors Code

---

When integrating with PhonePe’s APIs, it’s important to handle both successful and failed responses gracefully. A successful request returns an HTTP status code `200` along with the appropriate response payload. In case of failure, PhonePe provides a structured JSON response containing specific error parameters to help you identify and resolve the issue.

Handling these responses ensures your system can accurately track payment events, offer timely feedback to customers, and recover from errors without disruption. Below is a list of common error codes you may encounter, along with their meanings and recommended actions.

|  |  |  |
| --- | --- | --- |
| **Error Code** | **Description** | **Recommended Action** |
| 400 | Bad Request | Verify request parameters and JSON/body format. |
| 401 | Unauthorized Access | Check API keys or authentication tokens. |
| 404 | Resource Not Found | Ensure the endpoint or resource is correct. |
| 500 | Internal Server Error | Retry after a delay; contact support if issue persists. |

**📘** **When Is `errorContext` Returned in the Response?**

---

The `errorContext` field will be included in the status response **only if** `errorContext` is explicitly set to **True** in the request.

**Refer:** [Order Status API](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/order-status.md#nav-request) Documentation for details on request parameters and sample responses.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Detailed Error Code** | **Error Code** | **Stage** | **Source** | **Error Description** |
| TXN\_AUTO\_FAILED | TXN\_NOT\_COMPLETED | PRE\_AUTHENTICATION | CUSTOMER | Payment couldn’t be completed due to issues related to customer or their bank. |
| Z9 | INSUFFICIENT\_BALANCE | AUTHORIZATION | CUSTOMER | Payment failed due to insufficient balance in customer’s account. |
| ZM | INVALID\_MPIN | AUTHENTICATION | CUSTOMER | Customer entered the wrong UPI PIN. |
| U90 | BANK\_TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Bank is taking longer than usual to process this payment. |
| UT | BANK\_TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| U28 | BANK\_TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| Z7 | TXN\_FREQ\_LIMIT\_BREACHED | AUTHORIZATION | CUSTOMER | Customer exceeded their daily payment limit. |
| Z6 | MPIN\_LIMIT\_BREACHED | AUTHENTICATION | CUSTOMER | Customer entered wrong PIN too many times. |
| B3 | ACCOUNT\_NOT\_ELIGIBLE | AUTHORIZATION | CUSTOMER | Customer’s account type is not supported for this payment. |
| Z8 | TXN\_LIMIT\_BREACHED | AUTHORIZATION | CUSTOMER | Customer exceeded their daily payment limit. |
| XB | BANK\_TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| U03 | TXN\_LIMIT\_BREACHED | AUTHORIZATION | CUSTOMER | Customer exceeded the per-transaction limit. |
| XY | BANK\_TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| K1 | TXN\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank declined the payment for security reasons. |
| S96 | BANK\_TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| YE | ACCOUNT\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank account is blocked or frozen. |
| XH | ACCOUNT\_DOES\_NOT\_EXIST | AUTHORIZATION | CUSTOMER | Customer’s bank account is invalid or unregistered. |
| XT | BANK\_NOT\_ABLE\_TO\_PROCESS | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| IR | BANK\_NOT\_ABLE\_TO\_PROCESS | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| XP | TXN\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank blocked the payment. |
| NO | REQUEST\_NOT\_FOUND | AUTHORIZATION | BUSINESS | Original payment request not found. |
| T14 | INVALID\_REQUEST | AUTHORIZATION | BUSINESS | You provided invalid payment details. Please check and try again. |
| ZU | TXN\_LIMIT\_BREACHED | AUTHORIZATION | ISSUING\_BANK | Amount exceeds the limit set by the customer’s bank. |
| IE | INSUFFICIENT\_BALANCE | AUTHORIZATION | CUSTOMER | Insufficient balance in customer’s account. |
| XV | TXN\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank blocked the payment. |
| U66 | DEVICE\_FINGERPRINT\_MISMATCH | AUTHENTICATION | BUSINESS | Temporary technical issue. |
| AM | MPIN\_NOT\_SET | AUTHORIZATION | CUSTOMER | Customer hasn’t set a UPI PIN . |
| B1 | TXN\_NOT\_ALLOWED | AUTHORIZATION | CUSTOMER | Customer’s number registered with the bank is different. |
| XQ | TXN\_BLOCKED | AUTHORIZATION | BENEFICIARY\_BANK | Your bank blocked the payment. Contact your bank for help. |
| YC | TXN\_NOT\_ALLOWED | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| ZX | ACCOUNT\_INACTIVE | AUTHORIZATION | CUSTOMER | Customer’s bank account is inactive. |
| FP | TXN\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank account is frozen. |
| U80 | TECHNICAL\_ISSUE | AUTHORIZATION | PAYER\_PSP | Technical issue at the customer’s bank. |
| U54 | TXN\_NOT\_ALLOWED | AUTHORIZATION | BUSINESS | Transaction ID or amount mismatch. |
| SA | TXN\_NOT\_ALLOWED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank blocked the payment. |
| SD | ACCOUNT\_INACTIVE | AUTHORIZATION | CUSTOMER | Customer’s bank account is inactive. |
| U86 | TECHNICAL\_ISSUE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| ZG | TXN\_NOT\_ALLOWED | AUTHORIZATION | CUSTOMER | Customer’s UPI ID is restricted for this payment. |
| U69 | TXN\_NOT\_COMPLETED | PRE\_AUTHENTICATION | CUSTOMER | Payment request expired. |
| ZA | TXN\_CANCELLED | PRE\_AUTHENTICATION | CUSTOMER | Customer cancelled the payment. |
| ZH | INVALID\_VPA | AUTHORIZATION | CUSTOMER | Customer entered an invalid UPI ID. |
| U16\_NPCI\_TXNRISK\_00924 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_0 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00976 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01026 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01002 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00970 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00966 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01022 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00965 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01242 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00901 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01232 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01054 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01028 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00030 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01018 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01206 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00941 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01083 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00963 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00987 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_00980 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| U16\_NPCI\_TXNRISK\_01078 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| REQUEST\_TIME\_OUT | TXN\_NOT\_COMPLETED | PRE\_AUTHENTICATION | CUSTOMER | Payment request timed-out. |
| REQUEST\_CANCEL\_BY\_REQUESTER | TXN\_CANCELLED | PRE\_AUTHENTICATION | BUSINESS | You cancelled the payment request. Please send a new request to the customer. |
| REQUEST\_DECLINE\_BY\_REQUESTEE | TXN\_CANCELLED | PRE\_AUTHENTICATION | CUSTOMER | Customer cancelled the payment. |
| TXN\_NOT\_FOUND | TXN\_NOT\_FOUND | PRE\_AUTHENTICATION | BUSINESS | Payment failed due to temporary technical issue. |
| INTERNAL\_SECURITY\_BLOCK | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| INTERNAL\_SECURITY\_BLOCK\_1 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked as the payment URL doesn’t match the one you shared during onboarding. |
| INTERNAL\_SECURITY\_BLOCK\_2 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked as the IP address doesn’t match the one you shared during onboarding. |
| INTERNAL\_SECURITY\_BLOCK\_4 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked as the package name doesn’t match the one you shared during onboarding. |
| INTERNAL\_SECURITY\_BLOCK\_5 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked as the business policies are missing or outdated on your website/app. |
| INTERNAL\_SECURITY\_BLOCK\_6 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked as you have not completed your video KYC verification. |
| BF\_110 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| BF\_025 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| BF\_028 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| BF\_049 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| BL\_076 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| BL\_077 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked as you have not completed your video KYC verification. |
| BF\_034 | REFUND\_BREACHED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | There was not enough forward transaction balance for the concerned MID to process the refund.  You can then reinitiate the refund when you have enough forward transactions balance. |
| ORDER\_EXPIRED | TXN\_NOT\_COMPLETED | PRE\_AUTHENTICATION | CUSTOMER | Customer did not complete the payment. |
| ORDER\_CANCELLED\_BY\_USER | TXN\_CANCELLED | PRE\_AUTHENTICATION | CUSTOMER | Customer cancelled the payment. |
| AUTHENTICATION\_FAILED | AUTHENTICATION\_FAILED | AUTHENTICATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| INVALID\_CARD\_NUMBER | INVALID\_CARD\_NUMBER | PRE\_AUTHENTICATION | Customer | Customer didn’t enter the card details or entered incorrect ones. |
| BANK\_ERROR | BANK\_ERROR | UNKNOWN | ISSUING\_BANK | Technical issue at the customer’s bank. |
| TRANSACTION\_DECLINED | TRANSACTION\_DECLINED | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| TECHNICAL\_ISSUE\_BANK | TECHNICAL\_ISSUE\_BANK | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| INVALID\_DETAILS | INVALID\_DETAILS | AUTHENTICATION | PAYMENT\_GATEWAY | Customer entered invalid details. |
| BANK\_MERCHANT\_CONFIG | BANK\_MERCHANT\_CONFIG | AUTHENTICATION | PAYMENT\_GATEWAY | Temporary technical issue. |
| CONNECTION\_TIMEOUT | CONNECTION\_TIMEOUT | UNKNOWN | UNKNOWN | Payment request timed out. |
| ADDRESS\_MISMATCH | ADDRESS\_MISMATCH | AUTHENTICATION | Customer | Address provided for the order doesn’t match the customer’s bank records. |
| TRANSACTION\_DECLINED\_PG | TRANSACTION\_DECLINED\_PG | AUTHORIZATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| BUSINESS\_RISK\_RULES | BUSINESS\_RISK\_RULES | AUTHORIZATION | ISSUING\_BANK | Customer’s bank doesn’t allow payments with this card. |
| CARD\_BLOCKED | CARD\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s card is blocked by their bank. |
| CARD\_EXPIRED | CARD\_EXPIRED | AUTHORIZATION | Customer | Customer’s card is expired. |
| INVALID\_CVV\_EXPIRY | INVALID\_CVV\_EXPIRY | AUTHENTICATION | Customer | Customer entered an invalid CVV. |
| INVALID\_DETAILS\_MERCHANT | INVALID\_DETAILS\_MERCHANT | AUTHENTICATION | BUSINESS | You have entered invalid details. Please check and send the request to the customer again. |
| PROCESSOR\_ERROR | PROCESSOR\_ERROR | AUTHORIZATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| INVALID\_CARD\_TYPE | INVALID\_CARD\_TYPE | AUTHENTICATION | ISSUING\_BANK | Customer’s card is not supported for this payment. |
| INVALID\_FIELDS | INVALID\_FIELDS | AUTHENTICATION | Customer | Customer didn’t provide all the details for this payment. |
| INSUFFICIENT\_BALANCE | INSUFFICIENT\_BALANCE | AUTHORIZATION | Customer | Insufficient balance in customer’s account. |
| TRANSACTION\_TIME\_OUT | TRANSACTION\_TIME\_OUT | AUTHENTICATION | PAYMENT\_GATEWAY | Payment request timed out. |
| CANCELLED\_BY\_USER | CANCELLED\_BY\_USER | AUTHENTICATION | Customer | Customer didn’t complete the authentication process in time. |
| DUPLICATE\_TRANSACTION | DUPLICATE\_TRANSACTION | AUTHENTICATION | PAYMENT\_GATEWAY | A payment with the same Order ID is already in progress. |
| HASH\_MISMATCH | HASH\_MISMATCH | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| TXN\_AMOUNT\_MISMATCH | TXN\_AMOUNT\_MISMATCH | AUTHORIZATION | ISSUING\_BANK | Product amount is different from the the amount recorded by the bank. |
| INVALID\_TXN\_ID | INVALID\_TXN\_ID | UNKNOWN | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| ONLINE\_TRANSACTIONS\_DISABLED | ONLINE\_TRANSACTIONS\_DISABLED | AUTHORIZATION | Customer | Customer cannot use this card for online payments. |
| MAX\_AUTH\_EXCEEDED | MAX\_AUTH\_EXCEEDED | AUTHENTICATION | Customer | Customer has exceeded the maximum PIN attempts. |
| INVALID\_CARD\_NAME | INVALID\_CARD\_NAME | AUTHENTICATION | Customer | Customer entered an invalid card name. |
| WRONG\_PIN | WRONG\_PIN | AUTHENTICATION | Customer | Customer didn’t enter the OTP or entered an incorrect one. |
| INVALID\_AMOUNT | INVALID\_AMOUNT | AUTHORIZATION | Customer | Customer entered the wrong amount. |
| INVALID\_CARD | INVALID\_CARD | AUTHENTICATION | Customer | Customer entered an incorrect account number. |
| TRANSACTION\_LIMIT\_EXCEEDED | TRANSACTION\_LIMIT\_EXCEEDED | AUTHORIZATION | Customer | Customer exceeded their transaction limit. |
| MERCHANT\_ERROR | MERCHANT\_ERROR | AUTHORIZATION | BUSINESS | Technical issue at your end. |
| INTERNATIONAL\_TXN\_NOT\_ALLOWED | INTERNATIONAL\_TXN\_NOT\_ALLOWED | AUTHORIZATION | Customer | Customer’s card does not support international payments. |
| UNSUPPORTED\_PAYMENT\_MODE | UNSUPPORTED\_PAYMENT\_MODE | AUTHORIZATION | ISSUING\_BANK | Customer’s bank doesn’t allow payments with this instrument. |
| AUTHORIZATION\_FAILED | AUTHORIZATION\_FAILED | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| AUTH\_TIMEOUT | AUTH\_TIMEOUT | AUTHENTICATION | Customer | Customer didn’t complete authentication process in time. |
| CARD\_BIN\_NOT\_SUPPORTED | CARD\_BIN\_NOT\_SUPPORTED | AUTHORIZATION | ISSUING\_BANK | Customer’s card is not supported for this payment. |
| TXN\_FAILED | TXN\_FAILED | AUTHENTICATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| MERCHANT\_CONFIG\_NOT\_FOUND | MERCHANT\_CONFIG\_NOT\_FOUND | AUTHENTICATION | PAYMENT\_GATEWAY | Merchant validation failed as your configuration details are missing or incorrect at PhonePe PG. |
| PENDING | PENDING | AUTHORIZATION | ISSUING\_BANK | Payment is being processed. Please check after 15 minutes. |
| INVALID\_REQUEST | INVALID\_REQUEST | AUTHENTICATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| GENERIC\_NPCI\_ERROR | GENERIC\_NPCI\_ERROR | AUTHORIZATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| GENERIC\_ERROR | GENERIC\_ERROR | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_CURRENCY | INVALID\_CURRENCY | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_TXN | INVALID\_TXN | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_DATE | INVALID\_DATE | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| ENCRYPTION\_ERROR | ENCRYPTION\_ERROR | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| DECRYPTION\_ERROR | DECRYPTION\_ERROR | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_BANK\_CODE | INVALID\_BANK\_CODE | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| CHECKSUM\_MISMATCH | CHECKSUM\_MISMATCH | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_KEY | INVALID\_KEY | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_PARAMETERS | INVALID\_PARAMETERS | UNKNOWN | UNKNOWN | You passed invalid parameters. Please verify the details and try again. |
| INVALID\_CARD\_DETAILS | INVALID\_CARD\_DETAILS | AUTHENTICATION | Customer | Customer entered incorrect card details. |
| INVALID\_CUSTOMER\_ID | INVALID\_CUSTOMER\_ID | UNKNOWN | UNKNOWN | Payment failed due to invalid customer ID. |
| INCORRECT\_DETAILS | INCORRECT\_DETAILS | AUTHORIZATION | Customer | Customer entered incorrect card details. |
| MERCHANT\_CONFIG\_ERROR | MERCHANT\_CONFIG\_ERROR | AUTHENTICATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| CARD\_NOT\_ALLOWED | CARD\_NOT\_ALLOWED | AUTHENTICATION | Customer | Customer cannot make the payment using this card. |
| REFUND\_SUBMITTED | REFUND\_SUBMITTED | REFUND | ISSUING\_BANK | Your refund request has been submitted successfully. |
| INVALID\_REFUND\_REQUEST\_FIELDS | INVALID\_REFUND\_REQUEST\_FIELDS | REFUND | BUSINESS | You entered an invalid merchant code or incorrect amount. Please verify the details and try again. |
| TXN\_AMOUNT\_MISMATCH\_REFUND | TXN\_AMOUNT\_MISMATCH\_REFUND | REFUND | BUSINESS | The refund amount does not match the original payment amount. Please check and try again. |
| REFUND\_NOT\_ALLOWED | REFUND\_NOT\_ALLOWED | REFUND | BUSINESS | You cannot process this refund. |
| REFUND\_FOR\_TXN\_OLDER\_THAN\_LIMIT | REFUND\_FOR\_TXN\_OLDER\_THAN\_LIMIT | REFUND | BUSINESS | Refund failed as the payment was made over 90 days ago. Only payments within the last 90 days are refundable. |
| EXCESS\_REFUND\_AMOUNT | EXCESS\_REFUND\_AMOUNT | REFUND | BUSINESS | You have insufficient balance to process the refund. Please check and try again. |
| CHECKSUM\_GENERATION\_FAILED | CHECKSUM\_GENERATION\_FAILED | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| MISSING\_FIELDS | MISSING\_FIELDS | UNKNOWN | UNKNOWN | A required field is missing. Please fill in all mandatory parameters and try again. |
| INVALID\_CHECKSUM\_PARAMETERS | INVALID\_CHECKSUM\_PARAMETERS | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| MESSAGE\_FORMAT\_ERROR | MESSAGE\_FORMAT\_ERROR | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_CHECKSUM\_KEY | INVALID\_CHECKSUM\_KEY | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| INVALID\_MERCHANT\_CODE | INVALID\_MERCHANT\_CODE | UNKNOWN | UNKNOWN | You have not passed a valid merchant code. Please check and try again. |
| INVALID\_CUSTOMER\_RELATED\_FIELDS | INVALID\_CUSTOMER\_RELATED\_FIELDS | UNKNOWN | UNKNOWN | Customer details like name, email, or address are missing. |
| MISSING\_CHECKSUM\_VALUE | MISSING\_CHECKSUM\_VALUE | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| CAPTURE\_ERROR | CAPTURE\_ERROR | CAPTURE | BUSINESS | Payment failed due to temporary technical issue. |
| DECLINED\_BY\_ACQUIRER | DECLINED\_BY\_ACQUIRER | AUTHORIZATION | PAYMENT\_GATEWAY | Your bank has declined this payment. Please contact your bank for more details. |
| TXN\_NOT\_ALLOWED | TXN\_NOT\_ALLOWED | UNKNOWN | UNKNOWN | Payment not allowed. |
| TXN\_DATA\_TAMPERED | TXN\_DATA\_TAMPERED | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| DUPLICATE\_TXN\_REQUEST | DUPLICATE\_TXN\_REQUEST | UNKNOWN | ISSUING\_BANK | A transaction with the same details has already been processed. |
| TXN\_ALREADY\_PROCESSED | TXN\_ALREADY\_PROCESSED | AUTHORIZATION | ISSUING\_BANK | A transaction with the same details has already been processed. |
| INVALID\_ACCOUNT\_NUMBER | INVALID\_ACCOUNT\_NUMBER | AUTHENTICATION | BUSINESS | You have passed an invalid account number. Please check and try again. |
| UNSUPPORTED\_BY\_MERCHANT | UNSUPPORTED\_BY\_MERCHANT | UNKNOWN | BUSINESS | Payment failed as you do not support this payment type. |
| TXN\_NOT\_FOUND | TXN\_NOT\_FOUND | AUTHORIZATION | BUSINESS | Payment not found. |
| SUCCESS | SUCCESS | UNKNOWN | UNKNOWN | This payment is successful. |
| TXN\_STATUS\_AWAITED | TXN\_STATUS\_AWAITED | UNKNOWN | UNKNOWN | Payment is being processed. Please check after 15 minutes. |
| WITHDRAWAL\_LIMIT\_EXCEEDED | WITHDRAWAL\_LIMIT\_EXCEEDED | AUTHORIZATION | Customer | Customer’s bank declined the payment as they exceeded the withdrawal limit. |
| CARD\_VALIDATION\_FAILURE | CARD\_VALIDATION\_FAILURE | UNKNOWN | UNKNOWN | Payment failed due to temporary technical issue. |
| UNSUPPORTED\_TXN\_TYPE | UNSUPPORTED\_TXN\_TYPE | UNKNOWN | ISSUING\_BANK | Customer’s bank does not support this payment. |
| ACQUIRER\_UNAVAILABLE | ACQUIRER\_UNAVAILABLE | UNKNOWN | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| MERCHANT\_RESTRICTION | MERCHANT\_RESTRICTION | AUTHORIZATION | ISSUING\_BANK | Customer cannot make this payment using this card. |
| CARD\_NOT\_EXIST | CARD\_NOT\_EXIST | AUTHORIZATION | ISSUING\_BANK | The customer’s bank declined the payment as the card number is invalid. |
| CARD\_NOT\_ACTIVE | CARD\_NOT\_ACTIVE | AUTHORIZATION | ISSUING\_BANK | Customer’s card is inactive. |
| ACCOUNT\_NO\_LONGER\_ACTIVE | ACCOUNT\_NO\_LONGER\_ACTIVE | AUTHENTICATION | Customer | Customer’s bank account is inactive. |
| ORIGINAL\_TXN\_NOT\_FOUND | ORIGINAL\_TXN\_NOT\_FOUND | REFUND | PAYMENT\_GATEWAY | Original payment ID was not found. |
| NETWORK\_ERROR | NETWORK\_ERROR | AUTHENTICATION | NETWORK | Payment failed due to temporary technical issue. |
| MERCHANT\_CANCELLED | MERCHANT\_CANCELLED | CAPTURE | BUSINESS | Payment failed due to temporary technical issue. |
| PG\_TECHNICAL\_FAILURE | PG\_TECHNICAL\_FAILURE | AUTHENTICATION | PAYMENT\_GATEWAY | Payment failed due to temporary technical issue. |
| TECHNICAL\_ISSUE\_NETWORK | TECHNICAL\_ISSUE\_NETWORK | UNKNOWN | NETWORK | Payment failed due to temporary technical issue. |
| OTP\_EXPIRED | OTP\_EXPIRED | AUTHENTICATION | Customer | Customer entered an expired OTP. |
| AUTH\_PROCESS\_FAILED | AUTH\_PROCESS\_FAILED | AUTHENTICATION | Customer | Customer didn’t complete or failed the card authentication process. |
| SERVER\_UNAVAILABLE | SERVER\_UNAVAILABLE | AUTHENTICATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| WRONG\_MCC | WRONG\_MCC | AUTHORIZATION | PAYMENT\_GATEWAY | Customer cannot make this payment using a card. |
| CUSTOMER\_CARD\_BLOCKED | CUSTOMER\_CARD\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Customer’s bank has blocked this card. |
| PREVIOUS\_ORDER\_IN\_PROGRESS | PREVIOUS\_ORDER\_IN\_PROGRESS | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | A payment with the same order ID is already in progress. |
| DUPLICATE\_TRANSACTIONS | DUPLICATE\_TRANSACTIONS | AUTHORIZATION | ISSUING\_BANK | The customer’s bank declined the payment as a duplicate request was received within 15 seconds. |
| NETWORK\_TRACE\_FAILURE | NETWORK\_TRACE\_FAILURE | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| UNSUPPORTED\_TRANSACTION | UNSUPPORTED\_TRANSACTION | AUTHORIZATION | ISSUING\_BANK | Customer’s bank does not support this payment. |
| RESTRICTED\_USAGE | RESTRICTED\_USAGE | AUTHORIZATION | ISSUING\_BANK | Customer cannot make this payment using a card. |
| DATA\_ERROR | DATA\_ERROR | AUTHORIZATION | PAYMENT\_GATEWAY | Payment failed due to incorrect network name, CVV, or cryptogram. Please check and try again. |
| AMOUNT\_READ\_FAILURE | AMOUNT\_READ\_FAILURE | AUTHORIZATION | ISSUING\_BANK | Customer’s bank couldn’t read the transaction amount. |
| PAN\_MAPPING\_FAILURE | PAN\_MAPPING\_FAILURE | AUTHORIZATION | NETWORK | Technical issue at the customer’s bank. |
| CARD\_DEACTIVATED | CARD\_DEACTIVATED | AUTHORIZATION | Customer | Customer’s card is deactivated. |
| OTP\_VALIDATION\_FAILURE | OTP\_VALIDATION\_FAILURE | AUTHENTICATION | PAYMENT\_GATEWAY | Technical issue at the customer’s bank. |
| TIMED\_OUT | TXN\_AUTO\_FAILED | PRE\_AUTHENTICATION | CUSTOMER | Payment couldn’t be completed due to issues related to customer or their bank. |
| U16\_NPCI\_TXNRISK\_01069 | TXN\_BLOCKED | AUTHENTICATION | NPCI | Customer’s payment blocked due to security reasons. |
| BL\_086 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| ZD | VALIDATION\_ERROR | AUTHORIZATION | BUSINESS | Technical issue at the customer’s bank. |
| BL\_088 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Payment blocked due to security reasons. |
| NPCI\_SERVER\_ERROR | SERVER\_ERROR | OTHERS | NPCI | Payment failed due to technical issue |
| INSUFFICIENT\_FUNDS | INSUFFICIENT\_BALANCE | AUTHORIZATION | CUSTOMER | Payment failed due to insufficient balance in customer’s account. |
| PG\_ERROR | OTHERS | OTHERS | OTHERS | Transaction could not be processed |
| DECLINED\_BY\_ISSUER | TXN\_BLOCKED | AUTHORIZATION | ISSUING\_BANK | Technical issue at the customer’s bank. |
| BF\_108 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Transaction has been blocked due to security reasons |
| CR\_016 | TXN\_BLOCKED | PRE\_AUTHENTICATION | PAYMENT\_GATEWAY | Transaction has been blocked due to security reasons |
