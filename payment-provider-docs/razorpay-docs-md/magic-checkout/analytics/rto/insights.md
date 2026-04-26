<!-- Source: https://razorpay.com/docs/payments/magic-checkout/analytics/rto/insights -->

View information about cost savings, risky ZIP codes and IP Addresses and take specific actions as required. You can generate data for a selected period of up to the last 90 days.

**Watch Out!**

- We recommend integrating with logistics partners like [Shiprocket](/razorpay-docs-md/magic-checkout/rto-reduction/logistics-partners/shiprocket.md)  , [Delhivery](/razorpay-docs-md/magic-checkout/rto-reduction/logistics-partners/delhivery.md)  , [Unicommerce](/razorpay-docs-md/magic-checkout/rto-reduction/logistics-partners/unicommerce.md)  , [ClickPost](/razorpay-docs-md/magic-checkout/rto-reduction/logistics-partners/clickpost.md)

  and [iThink Logistics](/razorpay-docs-md/magic-checkout/rto-reduction/logistics-partners/ithink-logistics.md)

  to reflect the data on the widget.
- You can only view these widgets.

## Widgets

The following widgets are available in the **RTO Insights** tab of the [RTO Analytics Dashboard](/razorpay-docs-md/magic-checkout/analytics/rto.md). Check which widgets are applicable when you opt either for:

- COD Intelligence.
- Manual review of COD Orders.

## Cost Saved by COD Intelligence

The following chart provides insights only when you opt for **COD Intelligence** in the **Settings** section. It displays how much shipping cost you have saved as COD Intelligence blocked risky RTO orders.

You can filter the data to display it on a **Daily**, **Weekly** or **Monthly** basis. Hover over the graph for more details.

![RTO Analytics cost saved by COD intelligence graph](https://razorpay.com/docs/payments/magic-checkout/analytics/rto/build/browser/assets/images/rto-cost-saved-cod.jpg)

**Handy Tips**

The default shipping charge is ₹75. You can enter your average shipping charge in the field.

![RTO Analytics customise shipping charge](https://razorpay.com/docs/payments/magic-checkout/analytics/rto/build/browser/assets/images/rto-cost-saved-cod-charges.jpg)

## Cost Saved Due to Manual Review of COD Orders

The following chart provides insights only when you opt for **Manual review of COD orders** in the **Settings** section.

The **Cost saved due to manual review of COD orders** widget shows the trend of cost saved. You can view the data **Daily**, **Weekly** or **Monthly**.

![RTO cost savings via manual review](https://razorpay.com/docs/payments/magic-checkout/analytics/rto/build/browser/assets/images/rto-manual-review-cost-saved.jpg)

**Handy Tips** [Automate](/razorpay-docs-md/magic-checkout/order-settings/review-cod-orders/workflow.md#how-it-works) your manual review process or let COD Intelligence handle your COD Orders. Know more about the [RTO Analytics Dashboard for COD Intelligence](/razorpay-docs-md/magic-checkout/analytics/rto.md).

## RTO Orders by ZIP codes and IP Addresses

The following widget is available when you opt for either **COD Intelligence** or **Manual review of COD orders** in the **Settings** section.

This tab displays the RTO orders at the zipcode (PIN code) and IP address level. These are sorted based on the **RTO risk %**. You can also view the total number of orders shipped and returned for each zipcode and IP address.

![RTO Orders by ZIP codes and IP addresses](https://razorpay.com/docs/payments/magic-checkout/analytics/rto/build/browser/assets/images/rto-zipcode-ip-address.jpg)

You can block or unblock COD orders for a zipcode or an IP address. Orders from these ZIP codes or IP addresses will not be eligible for COD in the future. Click **next** to view more data.

### Related information

- [Risk Report](/razorpay-docs-md/magic-checkout/analytics/rto/risk-report.md)
- [Manually Review COD Orders](/razorpay-docs-md/magic-checkout/order-settings/review-cod-orders.md)
