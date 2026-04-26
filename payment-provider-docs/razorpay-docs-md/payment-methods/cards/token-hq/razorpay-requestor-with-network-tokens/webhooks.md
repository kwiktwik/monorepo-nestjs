<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/webhooks -->

Use Razorpay Webhooks to configure and receive notifications when a specific event occurs. When one of these events is triggered, we send an HTTP POST payload in JSON to the webhook's configured URL.

## Webhook Events for Token Status Updates

The table below lists the webhook events available for tokens.

**Handy Tips**

In case of network tokenised cards, the last 4 digits will be of the tokenised card and not the actual card.

### token.initiated

Initiated

copy

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa7j2z7",
  "event": "token.initiated",
  "contains": [
    "token"
  ],
  "payload": {
    "token": {
      "entity": {
        "id": "token_4lsdksD31GaZ09",
        "entity": "token",
        "customer_id": "cust_1Aa00000000001",
        "method": "card",
        "card": {
          "last4": "3335",
          "network": "Visa",
          "type": "debit",
          "issuer": "HDFC",
          "international": false,
          "emi": true,
          "sub_type": "consumer",
          "token_iin": "453335"
        },
        "compliant_with_tokenisation_guidelines": true,
        "expired_at": 1748716199,
        "status": "initiated",
        "notes": []
      }
    }
  }
}
```

### token.service\_provider.activated

Activated

copy

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa7j2z7",
  "event": "token.service_provider.activated",
  "contains": [
    "service_provider_token",
    "token"
  ],
  "payload": {
    "service_provider_token": {
      "entity": {
        "id": "spt_1234abcd",
        "entity": "service_provider_token",
        "provider_type": "network",
        "provider_name": "Visa",
        "interoperable": true,
        "status": "activated",
        "provider_data": {
          "token_reference_number": "sas7wqaoidasdfssdjjk",
          "payment_account_reference": "8324ssdas7wqaoidassdjjk",
          "token_iin": "453335",
          "token_expiry_month": 12,
          "token_expiry_year": 2021
        }
      }
    },
    "token": {
      "entity": {
        "id": "token_4lsdksD31GaZ09",
        "entity": "token",
        "customer_id": "cust_1Aa00000000001",
        "method": "card",
        "card": {
          "last4": "3335",
          "network": "Visa",
          "type": "debit",
          "issuer": "HDFC",
          "international": false,
          "emi": true,
          "sub_type": "consumer"
        },
        "compliant_with_tokenisation_guidelines": true,
        "service_provider_tokens": [
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "network",
            "provider_name": "Visa",
            "interoperable": true,
            "status": "activated",
            "provider_data": {
              "token_reference_number": "sas7wqaoidasdfssdjjk",
              "payment_account_reference": "8324ssdas7wqaoidassdjjk",
              "token_iin": "453335",
              "token_expiry_month": 12,
              "token_expiry_year": 2021
            }
          },
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "aggregator",
            "provider_name": "razorpay",
            "interoperable": false,
            "status": "activated",
            "provider_data": {
              "expired_at": 1748716199
            }
          }
        ],
        "expired_at": 1748716199,
        "status": "activated",
        "notes": []
      }
    }
  }
}
```

### Sample Payload for token.service\_provider.activated as part of payment

Token activated as part of payment

copy

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa7j2z7",
  "event": "token.service_provider.activated",
  "contains": [
    "service_provider_token",
    "token"
  ],
  "payload": {
    "service_provider_token": {
      "entity": {
        "id": "spt_1234abcd",
        "entity": "service_provider_token",
        "provider_type": "network",
        "provider_name": "Visa",
        "interoperable": true,
        "status": "activated",
        "provider_data": {
          "token_reference_number": "sas7wqaoidasdfssdjjk",
          "payment_account_reference": "8324ssdas7wqaoidassdjjk",
          "token_iin": "453335",
          "token_expiry_month": 12,
          "token_expiry_year": 2021
        }
      }
    },
    "token": {
      "entity": {
        "id": "token_4lsdksD31GaZ09",
        "entity": "token",
        "customer_id": "cust_1Aa00000000001",
        "method": "card",
        "card": {
          "last4": "3335",
          "network": "Visa",
          "type": "debit",
          "issuer": "HDFC",
          "international": false,
          "emi": true,
          "sub_type": "consumer"
        },
        "compliant_with_tokenisation_guidelines": true,
        "service_provider_tokens": [
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "network",
            "provider_name": "Visa",
            "interoperable": true,
            "status": "activated",
            "provider_data": {
              "token_reference_number": "sas7wqaoidasdfssdjjk",
              "payment_account_reference": "8324ssdas7wqaoidassdjjk",
              "token_iin": "453335",
              "token_expiry_month": 12,
              "token_expiry_year": 2021
            }
          },
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "aggregator",
            "provider_name": "razorpay",
            "interoperable": false,
            "status": "activated",
            "provider_data": {
              "expired_at": 1748716199
            }
          }
        ],
        "expired_at": 1748716199,
        "status": "activated",
        "notes": []
      }
    },
    "payment": {
      "entity": {
        "id": "pay_FPoJKWQQ8lK13n",
        "entity": "payment",
        "amount": 500000,
        "currency": "INR",
        "base_amount": 500000,
        "status": "captured",
        "order_id": "order_FPoIeimWki9j8A",
        "invoice_id": null,
        "international": false,
        "method": "netbanking",
        "amount_refunded": 190000,
        "amount_transferred": 0,
        "refund_status": "partial",
        "captured": true,
        "description": null,
        "card_id": null,
        "bank": "HDFC",
        "wallet": null,
        "vpa": null,
        "email": "gaurav.kumar@example.com",
        "contact": "+919000090000",
        "notes": [],
        "fee": 11800,
        "tax": 1800,
        "error_code": null,
        "error_description": null,
        "error_source": null,
        "error_step": null,
        "error_reason": null,
        "acquirer_data": {
          "bank_transaction_id": "4827433"
        },
        "created_at": 1597226379
      }
    }
  }
}
```

### token.service\_provider.cancelled

Suspended

copy

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa7j2z7",
  "event": "token.service_provider.cancelled",
  "contains": [
    "service_provider_token",
    "token"
  ],
  "payload": {
    "service_provider_token": {
      "entity": {
        "id": "spt_1234abcd",
        "entity": "service_provider_token",
        "provider_type": "network",
        "provider_name": "Visa",
        "interoperable": true,
        "status": "suspended",
        "provider_data": {
          "token_reference_number": "sas7wqaoidasdfssdjjk",
          "payment_account_reference": "8324ssdas7wqaoidassdjjk",
          "token_iin": "453335",
          "token_expiry_month": 12,
          "token_expiry_year": 2021
        }
      }
    },
    "token": {
      "entity": {
        "id": "token_4lsdksD31GaZ09",
        "entity": "token",
        "customer_id": "cust_1Aa00000000001",
        "method": "card",
        "card": {
          "last4": "3335",
          "network": "Visa",
          "type": "debit",
          "issuer": "HDFC",
          "international": false,
          "emi": true,
          "sub_type": "consumer"
        },
        "compliant_with_tokenisation_guidelines": true,
        "service_provider_tokens": [
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "network",
            "provider_name": "Visa",
            "interoperable": true,
            "status": "suspended",
            "provider_data": {
              "token_reference_number": "sas7wqaoidasdfssdjjk",
              "payment_account_reference": "8324ssdas7wqaoidassdjjk",
              "token_iin": "453335",
              "token_expiry_month": 12,
              "token_expiry_year": 2021
            }
          },
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "aggregator",
            "provider_name": "razorpay",
            "interoperable": false,
            "status": "activated",
            "provider_data": {
              "expired_at": 1748716199
            }
          }
        ],
        "expired_at": 1748716199,
        "status": "activated",
        "notes": []
      }
    }
  }
}
```

### token.service\_provider.deactivated

Deactivated

copy

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa7j2z7",
  "event": "token.service_provider.deactivated",
  "contains": [
    "service_provider_token",
    "token"
  ],
  "payload": {
    "service_provider_token": {
      "entity": {
        "id": "spt_1234abcd",
        "entity": "service_provider_token",
        "provider_type": "network",
        "provider_name": "Visa",
        "interoperable": true,
        "status": "deactivated",
        "provider_data": {
          "token_reference_number": "sas7wqaoidasdfssdjjk",
          "payment_account_reference": "8324ssdas7wqaoidassdjjk",
          "token_iin": "453335",
          "token_expiry_month": 12,
          "token_expiry_year": 2021
        }
      }
    },
    "token": {
      "entity": {
        "id": "token_4lsdksD31GaZ09",
        "entity": "token",
        "customer_id": "cust_1Aa00000000001",
        "method": "card",
        "card": {
          "last4": "3335",
          "network": "Visa",
          "type": "debit",
          "issuer": "HDFC",
          "international": false,
          "emi": true,
          "sub_type": "consumer"
        },
        "compliant_with_tokenisation_guidelines": true,
        "service_provider_tokens": [
          {
            "id": "spt_1234abcd",
            "entity": "service_provider_token",
            "provider_type": "network",
            "provider_name": "Visa",
            "interoperable": true,
            "status": "deactivated",
            "provider_data": {
              "token_reference_number": "sas7wqaoidasdfssdjjk",
              "payment_account_reference": "8324ssdas7wqaoidassdjjk",
              "token_iin": "453335",
              "token_expiry_month": 12,
              "token_expiry_year": 2021
            }
          }
        ],
        "expired_at": 1748716199,
        "status": "deactivated",
        "notes": []
      }
    }
  }
}
```

### token.service\_provider.failed

Failed

copy

```json
{
  "event": {
    "name": "token.service_provider.failed",
    "id": "RNR8hMNdcxoOdE",
    "service": "api-live",
    "payload": {
      "entity": "event",
      "account_id": "acc_J4wp4KDwgP3sX4",
      "event": "token.service_provider.failed",
      "contains": [
        "token",
        "service_provider_token"
      ],
      "payload": {
        "token": {
          "entity": {
            "id": "token_RNR8fPcREzZ8If",
            "customer_id": null,
            "method": "card",
            "created_at": 1759153135,
            "expired_at": 1885487399,
            "status": "failed",
            "notes": {
              "key1": "value3 new notes",
              "key2": "value2"
            },
            "source": "business",
            "entity": "token",
            "card": {
              "last4": "7474",
              "network": "Visa",
              "type": "debit",
              "cobranding_partner": null,
              "issuer": "ICIC",
              "international": false,
              "emi": false,
              "sub_type": "consumer",
              "token_iin": "442305271"
            },
            "compliant_with_tokenisation_guidelines": true,
            "service_provider_tokens": [
              {
                "id": "spt_RCEc38VJqgSyQ9",
                "entity": "service_provider_token",
                "provider_type": "network",
                "provider_name": "visa",
                "interoperable": true,
                "provider_data": {
                  "token_reference_number": "6f6b884be604faab0b251106abd90d0a",
                  "payment_account_reference": "V0010014623136258585767285530",
                  "token_expiry_month": 9,
                  "token_expiry_year": 2029
                },
                "status": "failed",
                "error": {
                  "code": "BAD_REQUEST_ERROR",
                  "description": "Failed to tokenise the card",
                  "source": "internal",
                  "step": "token_creation",
                  "reason": "token_creation_failed",
                  "metadata": "{}"
                }
              }
            ],
            "error": {
              "code": "BAD_REQUEST_ERROR",
              "description": "Failed to tokenise the card",
              "source": "internal",
              "step": "token_creation",
              "reason": "token_creation_failed",
              "metadata": "{}"
            }
          }
        },
        "service_provider_token": {
          "entity": [
            {
              "id": "spt_RCEc38VJqgSyQ9",
              "entity": "service_provider_token",
              "provider_type": "network",
              "provider_name": "visa",
              "interoperable": true,
              "provider_data": {
                "token_reference_number": "6f6b884be604faab0b251106abd90d0a",
                "payment_account_reference": "V0010014623136258585767285530",
                "token_expiry_month": 9,
                "token_expiry_year": 2029,
                "card": []
              },
              "status": "failed",
              "tokenised_terminal_id": "KHoy17IpWjN99l",
              "error": {
                "code": "BAD_REQUEST_ERROR",
                "description": "Failed to tokenise the card",
                "source": "internal",
                "step": "token_creation",
                "reason": "token_creation_failed",
                "metadata": "{}"
              }
            }
          ]
        }
      },
      "created_at": 1759153136
    },
    "owner_id": "J4wp4KDwgP3sX4",
    "owner_type": "merchant"
  }
}
```
