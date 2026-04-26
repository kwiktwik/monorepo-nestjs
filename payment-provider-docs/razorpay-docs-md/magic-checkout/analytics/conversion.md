<!-- Source: https://razorpay.com/docs/payments/magic-checkout/analytics/conversion -->

Magic Checkout's Conversion Analytics offers a detailed overview of your business's conversion activities and performance metrics.

It offers insights into your conversion funnels, checkout completion rates and user behavior patterns to help you optimise your checkout experience via:

- **Conversion Funnel Analysis**: Track user progression through checkout steps.
- **User Behaviour Insights**: Understand logged-in vs logged-out user performance.
- **Checkout Optimisation**: Identify drop-off points and improvement opportunities.

**Watch Out!**

This feature is available only for Shopify users.

## Get Started

Follow the steps given below to view insights about the various conversion activities:

1. Log in to the Dashboard.
2. Navigate to **Magic Checkout** → **Analytics** and click **Conversion**.

You can now view the **Conversion Analytics** on the Dashboard with conversion metrics.

![View conversion analytics on dashboard](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion.jpg)

**Handy Tips**

- Select the date range of your choice to view the data.
- Use **Compared to** option to compare current data with a previous period or specific date range. Green indicators show improvements, while red indicators show declines.
- Hover over the card headings to understand the calculation methodology.
- Hover alongside the graph lines to view the exact values for specific time periods.
- Download detailed reports including UTM attribution data (date, source, medium, campaign, orders, sales) and conversion funnel details (checkout render, address step reached, payment step reached, payment attempted, payment success, checkout conversion rates) for further analysis.

## Compare Data Across Time Periods

You can compare your current data against previous periods to track performance changes:

1. In the **Compared to** field, select the date or time range you want to compare against.
2. View the results with clear indicators:
   - **Green arrows** indicate improvements.
   - **Red arrows** show declines.
   - **Descriptive text** explains the changes. For example: `Conversion rate increased from 21.26% to 27.78%`.
   - **Charts display overlapping lines** for visual comparison between the selected time periods, with date labels at the bottom showing which line represents which period.

![Compare analytics data](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion-comparison.jpg)

## Conversion Metrics

The Conversion Analytics dashboard displays the following metrics to track your Magic Checkout conversion performance:

## Detailed View

The **Detailed view** section displays charts that allow you to analyse trends and patterns in your conversion data:

- **Checkout conversion funnel**: Bar chart showing user progression through each checkout step from initiation to order completion.

  ![View checkout conversion funnel](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion-funnel.jpg)
- **Logged out conversion funnel**: Step-by-step funnel analysis for users who started as guests and logged in during checkout.
- **Logged in conversion funnel**: Performance breakdown for users who were already logged in when they started checkout.

  ![View logged-in & logged-out conversion funnel](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion-logged-in-out.jpg)
- **Checkout conversion rate over time**: Line chart tracking overall conversion rate trends across your selected time period.

  ![View checkout conversion rate](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion-rate.jpg)
- **Logged out conversion rate**: Line chart showing conversion trends for guest users over time.
- **Logged in conversion rate**: Line chart displaying conversion patterns for pre-logged users over time.

  ![View logged-in & logged-out conversion funnel](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion-logged-in-out-rate.jpg)
- **Sales attribution**: Checkout performance segmented by UTM source, medium and campaign data showing how different traffic sources contribute to orders and revenue.

  ![View sales attribution](https://razorpay.com/docs/payments/magic-checkout/analytics/build/browser/assets/images/magic-analytics-conversion-sales-attribution.jpg)

## Bar Chart Terms

The following table explains each bar displayed in the conversion charts:

**Watch Out!**

- The **Order placed** metric in the checkout funnel reflects the number of sessions with at least one successful order, whereas **Total orders** counts every individual transaction. If a user completes multiple purchases within a single session, the funnel records it as one **Order placed** event. For instance, if 43 sessions result in 50 total orders, it indicates that 7 additional orders were placed by users during their existing sessions.
- The **Order conversion rate** may appear higher because it accounts for every individual transaction. In contrast, the **Checkout conversion rate** is session-based and only tracks whether a session was successful, regardless of how many orders were placed. When users place multiple orders in a single visit, the **Order conversion rate** will be higher while the **Checkout conversion rate** remains stable.
- The **Address pre-fill rate** counts all users who are logged in by the time they reach the address step. However, the logged-in funnel tracks **pre-logged** users who were already authenticated before starting the checkout process.
