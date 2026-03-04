// check-fb-events.cjs
require("dotenv").config();

async function main() {
  // Pixel + token for Conversions API
  const pixelId = process.env.ALERTSOUNDBOX_FACEBOOK_PIXEL_ID || process.env.FACEBOOK_PIXEL_ID;
  const accessToken = process.env.ALERTSOUNDBOX_FACEBOOK_CONVERSION_AP_TOKEN || process.env.VED_FACEBOOK_CONVERSION_AP_TOKEN;

  if (!pixelId || !accessToken) {
    console.error("Missing pixel ID or CAPI access token in .env");
    process.exit(1);
  }

  const testEventCode = "TEST2520";
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    test_event_code: testEventCode,
    data: [
      {
        event_name: "test_app_event",
        event_time: now,
        action_source: "app",
        user_data: {
          client_ip_address: "168.212.226.204",
        },
        app_data: {
          advertiser_tracking_enabled: 1,
          application_tracking_enabled: 1,
          extinfo: ["mb1"],
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/v21.0/${pixelId}/activities?access_token=${encodeURIComponent(
    accessToken,
  )}`;

  console.log("[FB CAPI] POST", url);
  console.log("[FB CAPI] Payload:", JSON.stringify(payload, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("[FB CAPI] Status:", res.status);
  console.log("[FB CAPI] Body:", text);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});