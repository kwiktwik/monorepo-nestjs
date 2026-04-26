<!-- Source: https://razorpay.com/docs/payments/cod-magic-checkout/shopify/login-with-razorpay/automation-tags -->

When customers authenticate through [Login with Razorpay (SSO)](/razorpay-docs-md/cod-magic-checkout/shopify/login-with-razorpay.md) on your Shopify store, specific tags are automatically assigned to their profiles. These tags provide automation capabilities that enhance your marketing efforts and improve customer engagement.

Advantages

- **Zero Additional Cost**: This feature is included with your Magic Checkout integration.
- **Boost Revenue**: Create targeted marketing campaigns that convert more effectively.
- **Time Saving**: Automate customer journeys that would otherwise require manual segmentation.
- **Seamless Integration**: Works with your existing marketing tools and Shopify workflows.

## List of Tags

**Login with Razorpay** automatically applies the following tags to customer profiles in Shopify:

### Example: Customer Journey with Tags

These tags enable automation possibilities for your store. Create personalised retargeting flows based on login behaviour:

- Send WhatsApp messages to customers tagged with `MAGIC_LOGIN_AUTO` who have not completed a purchase in 7 days.
- Offer special promotions to customers with `MAGIC_LOGIN_MANUAL` tags who abandoned their carts.
- Use `LOGIN_TIMESTAMP` to trigger time-sensitive offers after login events.

#### Example Setup

This example demonstrates how to create an automated campaign to re-engage customers who have not placed orders recently.

Follow the steps given below:

1. **Customer Identification**:
   - Customer logs in (automatically/manually through Magic).
   - System automatically assigns `Magic_login` tag.
2. **Segment Creation**:
   - Create segment: Customers who have not placed an order since February.
   - This segment dynamically updates as customer behaviour changes.
3. **Campaign Rule**: If customer has **Magic\_login** tag and customer belongs to **No orders since February** segment then send an **Email**.

#### Additional Campaign Possibilities

The system supports unlimited automation combinations based on your requirements. Common use cases include:

Product Interest Campaigns

High-Value Customer Recovery

Behavioural Trigger Campaigns

- Customer identified + viewed specific items → send targeted coupon.
- Customer identified + browsed category multiple times → send category-specific offers.

## Compatible Automation Tools

Leverage Razorpay Shopify tags with various automation platforms:

- **Shopify Flow**: Create conditional workflows using the login tags as triggers.
- **Zapier**: Connect to hundreds of apps based on tag events.
- **WhatsApp Business Solutions**: Trigger customer communications based on tag status.
- **Email Marketing Tools**: Create segments based on login behaviour.

For advanced use cases, combine multiple tags to create targeted customer segments with specific behaviours and attributes.

### Related Information [Customer Analytics](/razorpay-docs-md/cod-magic-checkout/shopify/login-with-razorpay/customer-analytics.md)
