<!-- Source: https://razorpay.com/docs/payments/server-integration/dot-net/troubleshooting-faqs -->

1. How to resolve the following error displayed during Orders API integration?

Following are the solutions for two possible errors:

### Server Response: Array

**Resolution**

- **Fix 1**: Verify if client supports TLS v1.1 using this website: [How's My SSL?](https://www.howsmyssl.com/s/api.html)  . If yes, upgrade the client to `TLS v1.1+`.
- **Fix 2**: Use the code given below to force TLS v1.2:

Force TLS v1.2

copy

```c
System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
```

### Exception User-Unhandled

**Resolution**

Use the code given below to force TLS v1.2.

Force TLS v1.2

copy

```c
System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
```

2. Does Razorpay support ASP.NET?

We only have the .NET framework on which ASP.NET works; we do not support it for .NET core.
