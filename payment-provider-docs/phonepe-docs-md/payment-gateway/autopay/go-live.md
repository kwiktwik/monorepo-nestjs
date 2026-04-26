<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/go-live -->

# How to Go-Live

---

After completing Integration, send a testing URL/App with the PhonePe Integration team for the sanity check. Once verified in UAT, the UAT Sign-off will be provided. Then, the Production credentials will be shared by PhonePe.

Ensure the following steps while migrating from UAT to Production for Go Live.

**Step 1**: **Replace the Host URLs**
Change the Host Endpoint from UAT to Production as given below.

| APIs | Production Host URLs |
| --- | --- |
| Auth Token API | https://api.phonepe.com/apis/identity-manager |
| Other APIs (Setup, Redemption, Status, Cancel) | https://api.phonepe.com/apis/pg |

**Step 2: Replace the Client ID and Secret Key**
Replace the UAT Client Id and Client Secret Keys with the **Production Client Id and Client Secret Keys** to generate the Auth Token.

**Step 3**: **Generate the Production Auth Token**
Generate the auth token for production by hitting the Auth Token API and use it with all the Autopay related APIs (Setup, Redemption, Status, Cancel)
