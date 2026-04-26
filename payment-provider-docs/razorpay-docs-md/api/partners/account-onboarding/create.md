<!-- Source: https://razorpay.com/docs/api/partners/account-onboarding/create -->

# Create an Account

Copy for AI

View as Markdown

`POST`

`/v2/accounts`

Use this endpoint to create an account.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -X POST https://api.razorpay.com/v2/accounts \
-u <ACCESS_TOKEN> \
-H "Content-Type: application/json" \
-d '{
  "email": "gauriagain.kumar@example.org",
  "phone": "9000090000",
  "legal_business_name": "Acme Corp",
  "business_type": "partnership",
  "customer_facing_business_name": "Example",
  "profile": {
    "category": "healthcare",
    "subcategory": "clinic",
    "description": "Healthcare E-commerce platform",
    "addresses": {
      "operation": {
        "street1": "507, Koramangala 6th block",
        "street2": "Kormanagala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": 560047,
        "country": "IN"
      },
      "registered": {
        "street1": "507, Koramangala 1st block",
        "street2": "MG Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": 560034,
        "country": "IN"
      }
    },
    "business_model": "Online Clothing ( men, women, ethnic, modern ) fashion and lifestyle, accessories, t-shirt, shirt, track pant, shoes."
  },
  "legal_info": {
    "pan": "AAACL1234C",
    "gst": "18AABCU9603R1ZM"
  },
  "brand": {
    "color": "FFFFFF"
  },
  "notes": {
    "internal_ref_id": "123123"
  },
  "contact_name": "Gaurav Kumar",
  "contact_info": {
    "chargeback": {
      "email": "cb@example.org"
    },
    "refund": {
      "email": "cb@example.org"
    },
    "support": {
      "email": "support@example.org",
      "phone": "9999999998",
      "policy_url": "https://www.google.com"
    }
  },
  "apps": {
    "websites": [
      "https://www.example.org"
    ],
    "android": [
      {
        "url": "playstore.example.org",
        "name": "Example"
      }
    ],
    "ios": [
      {
        "url": "appstore.example.org",
        "name": "Example"
      }
    ]
  }
}'
```

Success

```json
{
  "id": "acc_GRWKk7qQsLnDjX",
  "type": "standard",
  "status": "created",
  "email": "gauriagain.kumar@example.org",
  "profile": {
    "category": "healthcare",
    "subcategory": "clinic",
    "addresses": {
      "registered": {
        "street1": "507, Koramangala 1st block",
        "street2": "MG Road",
        "city": "Bengaluru",
        "state": "KARNATAKA",
        "postal_code": 560034,
        "country": "IN"
      },
      "operation": {
        "street1": "507, Koramangala 6th block",
        "street2": "Kormanagalo",
        "city": "Bengaluru",
        "state": "KARNATAKA",
        "country": "IN",
        "postal_code": 560047
      }
    },
    "business_model": "Online Clothing ( men, women, ethnic, modern ) fashion and lifestyle, accessories, t-shirt, shirt, track pant, shoes."
  },
  "notes": {
    "internal_ref_id": "123123"
  },
  "created_at": 1611136837,
  "phone": "9000090000",
  "business_type": "partnership",
  "legal_business_name": "Acme Corp",
  "customer_facing_business_name": "Example",
  "legal_info": {
    "pan": "AAACL1234C",
    "gst": "18AABCU9603R1ZM"
  },
  "apps": {
    "websites": [
      "https://www.example.org"
    ],
    "android": [
      {
        "url": "playstore.example.org",
        "name": "Example"
      }
    ],
    "ios": [
      {
        "url": "appstore.example.org",
        "name": "Example"
      }
    ]
  },
  "brand": {
    "color": "#FFFFFF"
  },
  "contact_info": {
    "chargeback": {
      "email": "cb@example.org",
      "phone": null,
      "policy_url": null
    },
    "refund": {
      "email": "cb@example.org",
      "phone": null,
      "policy_url": null
    },
    "support": {
      "email": "support@example.org",
      "phone": "9999999998",
      "policy_url": "https://www.google.com"
    }
  }
}
```

###### Request Parameters

`email`

\*

`string`

The sub-merchant's business email address.

`phone`

\*

`integer`

The sub-merchant's business phone number, without the country code. The minimum length is 8 characters and the maximum length is 15. For example, `9876543210`.

`legal_business_name`

\*

`string`

The name of the sub-merchant's business. For example, `Acme Corp`. The minimum length is 4 characters and the maximum length is 200.

`customer_facing_business_name`

`string`

The sub-merchant billing label as it appears on the Dashboard. The minimum length is 1 character and the maximum length is 255.

`business_type`

\*

`string`

The type of business operated by the sub-merchant. Possible values: [Business Types](/docs/partners/aggregators/onboarding-api/appendix/).

`reference_id`

`string`

Partner's external account reference id. The minimum length is 1 character and the maximum length is 512.

`profile`

`object`

The business details of the sub-merchant's account.

Show child parameters (5)

`legal_info`

`object`

The legal details about the sub-merchant's business.

Show child parameters (3)

`brand`

`object`

The branding details of the sub-merchant's business.

Show child parameters (1)

`notes`

`object`

Contains user-defined fields stored by the partner for reference purposes.

`contact_name`

\*

`string`

The name of the contact. The minimum length is 4 and the maximum length is 255 characters.

`contact_info`

`object`

Options available for contact support.

Show child parameters (3)

`apps`

`object`

The website/app details of the sub-merchant's business.

Show child parameters (3)

###### Response Parameters

`id`

`string`

The unique identifier of a sub-merchant account generated by Razorpay. The maximum length is 18 characters. For example, `acc_GLGeLkU2JUeyDZ`.

`type`

`string`

The account type. Possible value is `standard`.

`status`

`string`

The status of the account. Possible values:

- `created`: Account status when the merchant account is created.
- `activated`: Account status when the merchant KYC is approved.
- `needs_clarification`: Account status when the merchant is asked to provide clarifications related to the KYC details submitted.
- `under_review`: Account status when the merchant submits all the KYC requirements.
- `suspended`: Account status when the merchant account is identified as potentially fraudulent and is suspended.
- `rejected`: Account status when the KYC details submitted by the merchant are rejected during manual review.

`email`

`string`

The sub-merchant's business email address.

`phone`

`integer`

The sub-merchant's business phone number. The minimum length is 8 characters and the maximum length is 15.

`legal_business_name`

`string`

The name of the sub-merchant's business. For example, `Acme Corp`. The minimum length is 4 characters and the maximum length is 200.

`customer_facing_business_name`

`string`

The sub-merchant billing label as it appears on the Dashboard. The minimum length is 1 character and the maximum length is 255. This parameter might be required to complete the KYC process. However, it is optional for this API.

`business_type`

`string`

The type of business operated by the sub-merchant. Possible values: [Business Types](/docs/partners/aggregators/onboarding-api/appendix/).

`reference_id`

`string`

Partner's external account reference id. The minimum length is 1 character and the maximum length is 512.

`profile`

`object`

The business details of the sub-merchant's account.

Show child parameters (5)

`legal_info`

`object`

The legal details about the sub-merchant's business.

Show child parameters (3)

`brand`

`object`

The branding details of the sub-merchant's business.

Show child parameters (1)

`notes`

`object`

Contains user-defined fields stored by the partner for reference purposes.

`contact_name`

`string`

The name of the contact. The minimum length is 4 and the maximum length is 255 characters.

`contact_info`

`object`

Options available for contact support.

Show child parameters (3)

`apps`

`object`

The app details of the sub-merchant's business

Show child parameters (3)

`activated_at`

`integer`

Unix timestamp that indicates when the merchant account was activated. This parameter has `null` value till the account is activated.

`live`

`boolean`

Indicates the payments acceptance status of the merchant account. Possible values:

- `true`: Merchant can start accepting customer payments.
- `false`: Merchant cannot accept customer payments.

`hold_funds`

`boolean`

Indicates the settlements status of the merchant account. Possible values:

- `true`: Settlement are on hold. Funds are not transferred to the merchant account.
- `false`: Settlements can be transferred to the merchant account.

# Create an Account

Copy for AI

View as Markdown

`POST`

`/v2/accounts`

Use this endpoint to create an account.

Request Parameters

Response Parameters

###### Request Parameters

`email`

\*

`string`

The sub-merchant's business email address.

`phone`

\*

`integer`

The sub-merchant's business phone number, without the country code. The minimum length is 8 characters and the maximum length is 15. For example, `9876543210`.

`legal_business_name`

\*

`string`

The name of the sub-merchant's business. For example, `Acme Corp`. The minimum length is 4 characters and the maximum length is 200.

`customer_facing_business_name`

`string`

The sub-merchant billing label as it appears on the Dashboard. The minimum length is 1 character and the maximum length is 255.

`business_type`

\*

`string`

The type of business operated by the sub-merchant. Possible values: [Business Types](/docs/partners/aggregators/onboarding-api/appendix/).

`reference_id`

`string`

Partner's external account reference id. The minimum length is 1 character and the maximum length is 512.

`profile`

`object`

The business details of the sub-merchant's account.

Show child parameters (5)

`legal_info`

`object`

The legal details about the sub-merchant's business.

Show child parameters (3)

`brand`

`object`

The branding details of the sub-merchant's business.

Show child parameters (1)

`notes`

`object`

Contains user-defined fields stored by the partner for reference purposes.

`contact_name`

\*

`string`

The name of the contact. The minimum length is 4 and the maximum length is 255 characters.

`contact_info`

`object`

Options available for contact support.

Show child parameters (3)

`apps`

`object`

The website/app details of the sub-merchant's business.

Show child parameters (3)

###### Response Parameters

`id`

`string`

The unique identifier of a sub-merchant account generated by Razorpay. The maximum length is 18 characters. For example, `acc_GLGeLkU2JUeyDZ`.

`type`

`string`

The account type. Possible value is `standard`.

`status`

`string`

The status of the account. Possible values:

- `created`: Account status when the merchant account is created.
- `activated`: Account status when the merchant KYC is approved.
- `needs_clarification`: Account status when the merchant is asked to provide clarifications related to the KYC details submitted.
- `under_review`: Account status when the merchant submits all the KYC requirements.
- `suspended`: Account status when the merchant account is identified as potentially fraudulent and is suspended.
- `rejected`: Account status when the KYC details submitted by the merchant are rejected during manual review.

`email`

`string`

The sub-merchant's business email address.

`phone`

`integer`

The sub-merchant's business phone number. The minimum length is 8 characters and the maximum length is 15.

`legal_business_name`

`string`

The name of the sub-merchant's business. For example, `Acme Corp`. The minimum length is 4 characters and the maximum length is 200.

`customer_facing_business_name`

`string`

The sub-merchant billing label as it appears on the Dashboard. The minimum length is 1 character and the maximum length is 255. This parameter might be required to complete the KYC process. However, it is optional for this API.

`business_type`

`string`

The type of business operated by the sub-merchant. Possible values: [Business Types](/docs/partners/aggregators/onboarding-api/appendix/).

`reference_id`

`string`

Partner's external account reference id. The minimum length is 1 character and the maximum length is 512.

`profile`

`object`

The business details of the sub-merchant's account.

Show child parameters (5)

`legal_info`

`object`

The legal details about the sub-merchant's business.

Show child parameters (3)

`brand`

`object`

The branding details of the sub-merchant's business.

Show child parameters (1)

`notes`

`object`

Contains user-defined fields stored by the partner for reference purposes.

`contact_name`

`string`

The name of the contact. The minimum length is 4 and the maximum length is 255 characters.

`contact_info`

`object`

Options available for contact support.

Show child parameters (3)

`apps`

`object`

The app details of the sub-merchant's business

Show child parameters (3)

`activated_at`

`integer`

Unix timestamp that indicates when the merchant account was activated. This parameter has `null` value till the account is activated.

`live`

`boolean`

Indicates the payments acceptance status of the merchant account. Possible values:

- `true`: Merchant can start accepting customer payments.
- `false`: Merchant cannot accept customer payments.

`hold_funds`

`boolean`

Indicates the settlements status of the merchant account. Possible values:

- `true`: Settlement are on hold. Funds are not transferred to the merchant account.
- `false`: Settlements can be transferred to the merchant account.

Curl

```bash
curl -X POST https://api.razorpay.com/v2/accounts \
-u <ACCESS_TOKEN> \
-H "Content-Type: application/json" \
-d '{
  "email": "gauriagain.kumar@example.org",
  "phone": "9000090000",
  "legal_business_name": "Acme Corp",
  "business_type": "partnership",
  "customer_facing_business_name": "Example",
  "profile": {
    "category": "healthcare",
    "subcategory": "clinic",
    "description": "Healthcare E-commerce platform",
    "addresses": {
      "operation": {
        "street1": "507, Koramangala 6th block",
        "street2": "Kormanagala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": 560047,
        "country": "IN"
      },
      "registered": {
        "street1": "507, Koramangala 1st block",
        "street2": "MG Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": 560034,
        "country": "IN"
      }
    },
    "business_model": "Online Clothing ( men, women, ethnic, modern ) fashion and lifestyle, accessories, t-shirt, shirt, track pant, shoes."
  },
  "legal_info": {
    "pan": "AAACL1234C",
    "gst": "18AABCU9603R1ZM"
  },
  "brand": {
    "color": "FFFFFF"
  },
  "notes": {
    "internal_ref_id": "123123"
  },
  "contact_name": "Gaurav Kumar",
  "contact_info": {
    "chargeback": {
      "email": "cb@example.org"
    },
    "refund": {
      "email": "cb@example.org"
    },
    "support": {
      "email": "support@example.org",
      "phone": "9999999998",
      "policy_url": "https://www.google.com"
    }
  },
  "apps": {
    "websites": [
      "https://www.example.org"
    ],
    "android": [
      {
        "url": "playstore.example.org",
        "name": "Example"
      }
    ],
    "ios": [
      {
        "url": "appstore.example.org",
        "name": "Example"
      }
    ]
  }
}'
```

Success

```json
{
  "id": "acc_GRWKk7qQsLnDjX",
  "type": "standard",
  "status": "created",
  "email": "gauriagain.kumar@example.org",
  "profile": {
    "category": "healthcare",
    "subcategory": "clinic",
    "addresses": {
      "registered": {
        "street1": "507, Koramangala 1st block",
        "street2": "MG Road",
        "city": "Bengaluru",
        "state": "KARNATAKA",
        "postal_code": 560034,
        "country": "IN"
      },
      "operation": {
        "street1": "507, Koramangala 6th block",
        "street2": "Kormanagalo",
        "city": "Bengaluru",
        "state": "KARNATAKA",
        "country": "IN",
        "postal_code": 560047
      }
    },
    "business_model": "Online Clothing ( men, women, ethnic, modern ) fashion and lifestyle, accessories, t-shirt, shirt, track pant, shoes."
  },
  "notes": {
    "internal_ref_id": "123123"
  },
  "created_at": 1611136837,
  "phone": "9000090000",
  "business_type": "partnership",
  "legal_business_name": "Acme Corp",
  "customer_facing_business_name": "Example",
  "legal_info": {
    "pan": "AAACL1234C",
    "gst": "18AABCU9603R1ZM"
  },
  "apps": {
    "websites": [
      "https://www.example.org"
    ],
    "android": [
      {
        "url": "playstore.example.org",
        "name": "Example"
      }
    ],
    "ios": [
      {
        "url": "appstore.example.org",
        "name": "Example"
      }
    ]
  },
  "brand": {
    "color": "#FFFFFF"
  },
  "contact_info": {
    "chargeback": {
      "email": "cb@example.org",
      "phone": null,
      "policy_url": null
    },
    "refund": {
      "email": "cb@example.org",
      "phone": null,
      "policy_url": null
    },
    "support": {
      "email": "support@example.org",
      "phone": "9999999998",
      "policy_url": "https://www.google.com"
    }
  }
}
```
