<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/python-be-sdk/sdk-reference-python/installation -->

# Python SDK Installation

---

Integrating the **PhonePe Python SDK(v 2.1.8)** into your website is the first step toward enabling secure and reliable digital payments. The SDK supports creation of separate client instances for each set of credentials including client ID and client secret. The SDK maintains a list of initialized instances, and if the same credentials are used again, it returns the existing instance instead of creating a new one or throwing an exception.

To integrate the PhonePe Payment Gateway into your Python project, start by installing the `phonepe_sdk` package:

- Open a terminal or command prompt.
- Run the following command to install the phonepe\_sdk package:

install phonepe\_sdk package

```
pip install phonepe-pg-sdk-python
```

### What does this command mean?

- **–index-url :** Specifies the primary package index URL for phonepe\_sdk. It tells pip to download the package from Phone Payment Gateway’s official repository
- **–extra-index-url** : Adds an additional index URL (PyPI) to search as a backup source for dependencies
- **phonepe\_sdk** : The name of the package being installed

This command will install the SDK from the specified repository. If everything is set up correctly, you can import and use the phonepe\_sdk library in your Python projects.

## What’s Next?

Now that you’ve added the Python SDK to your project, the next step is to initialize the required classes.

Head over to the Class Initialization section to learn how to set it up properly.
