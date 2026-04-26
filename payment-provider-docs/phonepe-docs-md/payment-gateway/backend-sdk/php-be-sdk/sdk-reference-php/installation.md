<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/php-be-sdk/sdk-reference-php/installation -->

# PHP SDK Installation

---

## Mandatory Setup

Before proceeding with the installation steps below, you must add the following repository details to your project’s root composer.json file. This step is required to fetch the **PhonePe PHP SDK** package.

Code Reference

```
{
 "repositories": [
      {
        "type": "package",
        "url": "./vendor/phonepe/pg-sdk-php/",
        "package": {
          "name": "phonepe/pg-php-sdk-v2",
          "version": "2.0.0",
          "dist": {
            "url": "https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-php-sdk/v2-sdk.zip",
            "type": "zip"
          },
          "autoload": {
            "classmap": ["/"]
          }
        }
      }
    ],

    "require": {
        "phonepe/pg-php-sdk-v2": "^2.0",
        "vlucas/phpdotenv": "^5.6",
        "netresearch/jsonmapper": "^4.4"
    }
}
```

## Installation Options

- **Using Composer (Recommended)**
  - Install the dependencies using Composer:

Command to Run

```
composer install
```

- **Manual Installation (Not Recommended)**
  - Download the SDK source code and manually include the required files in your project.
  - **Note:** This method requires manual management of dependencies.
  - Ensure the following packages are also added:
    - `vlucas/phpdotenv`
    - `netresearch/jsonmapper`

## What’s Next?

You’ve that you have installed the **PhonePe PHP SDK**. Let’s move with Class Initialization.

Head over to the next section to learn how to initialize Class.
