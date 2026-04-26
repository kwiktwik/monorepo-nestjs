<!-- Source: https://developer.phonepe.com/offline-integration/others/getting-started-with-your-api -->

# Getting Started With Your API

---

This page will help you get started with Offline-Simulator.

We have migrated to the Phonepe Simulator application for UAT testing instead of the Preprod environment.

For using the Simulator application, you need to install Simulator APK on your android mobile from the below url given and test all payments from that application. We also have shared new salt keys which are supported by Simulator environment and MID. Currently Simulator application is capable to support all our integration solutions like Open Intent Collect Call API, Integrated DQR API, Paylink API and Integrated Static QR solutions.

Please download the Simulator app using the link: <https://docs.phonepe.com/public/zAWLKIsBbFcVzOujiGfP>

Steps to configure a template on the Simulator app:

1. Download and install the Phonepe Simulator application, while installing if it’s shows a pop-up screen as blocker, then click on **Install Anyway** button
2. When the Phonepe Simulator app is installed successfully, open the app & click on Scan & Pay button, it will ask you to enter the VPA: VPA format should be **YourMobilenumber@ybl** example 8296812345@ybl and click on “Confirm VPA” button. ( This is only for the 1st time registration)

Template name and details are shared [here](/phonepe-docs-md/offline-integration/others/template-names-with-description.md)

Please do these additional configuration for testing your Collect Call:

1. Open the Simulator app> Goto Settings> Click on “VPA for collect” option and enter the required VPA , the format should be **YourMobilenumber@ybl** example 8296812345@ybl and click on OK
2. After Collect Call request is generated using Collect Call Api, open the Simulator app & click on Fetch Collect option
