<!-- Source: https://developer.phonepe.com/offline-integration/dynamic-qr-solution/dqr-init-api -->

# DQR Init API

DQR Init API is used when the merchant wants to generate a dynamic QR on their screen

---

**UAT Endpoints:**
`POST` <https://mercury-uat.phonepe.com/enterprise-sandbox/v3/qr/init>

**Prod Endpoints:**
`POST` <https://mercury-t2.phonepe.com/v3/qr/init>

## Request Headers

| Header Name | Header Value |
| --- | --- |
| *`Content-Type`* | application/json |
| *`X-VERIFY`* | SHA256(base64 encoded payload + â/v3/qr/initâ + salt key) + ### + salt index |
| *`X-CALL-MODE`* | **HTTP** mode to be used for callback. Default Value: POST |
| *`X-PROVIDER-ID`* | Used for the cases where the merchants are getting onboarded via their Providers |
| *`X-CALLBACK-URL`* | Merchants need to pass their Callback URL to receive automated callbacks/ webhooks from Phonepe post performing transactions |

Sample Request â Payload

```
{
  "merchantId": "MERCHANTUAT",
  "transactionId": "TX32321849644234",
  "merchantOrderId": "TX32321849644234",
  "amount": 1000,
  "storeId": "234555",
  "terminalId": "894237",
  "expiresIn": 1800,
  "gstBreakup": {
    "gst": 100,
    "cgst": 25,
    "cess": 25,
    "sgst": 25,
    "igst": 25,
    "gstIncentive": 100,
    "gstPercentage": 10
  },
  "invoiceDetails": {
    "invoiceNumber": "123456fffff##_##",
    "invoiceDate": "2021-06-29T10:13:54.022Z",
    "invoiceName": "bccbd_cjdcdjc******"
  }
}
```

Sample Request â Base64 Encoded Payload

```
{
  "request": "ewogICJtZXJjaGFudElkIjogIk1FUkNIQU5UVUFUIiwKICAidHJhbnNhY3Rpb25JZCI6ICJUWDMyMzIxODQ5NjQ0MjM0IiwKICAibWVyY2hhbnRPcmRlcklkIjogIlRYMzIzMjE4NDk2NDQyMzQiLAogICJhbW91bnQiOiAxMDAwLAogICJzdG9yZUlkIjogIjIzNDU1NSIsCiAgInRlcm1pbmFsSWQiOiAiODk0MjM3IiwKICAiZXhwaXJlc0luIjogMTgwMCwKICAiZ3N0QnJlYWt1cCI6IHsKICAgICJnc3QiOiAxMDAsCiAgICAiY2dzdCI6IDI1LAogICAgImNlc3MiOiAyNSwKICAgICJzZ3N0IjogMjUsCiAgICAiaWdzdCI6IDI1LAogICAgImdzdEluY2VudGl2ZSI6IDEwMCwKICAgICJnc3RQZXJjZW50YWdlIjogMTAKICB9LAogICJpbnZvaWNlRGV0YWlscyI6IHsKICAgICJpbnZvaWNlTnVtYmVyIjogIjEyMzQ1NmZmZmZmIyNfIyMiLAogICAgImludm9pY2VEYXRlIjogIjIwMjEtMDYtMjlUMTA6MTM6NTQuMDIyWiIsCiAgICAiaW52b2ljZU5hbWUiOiAiYmNjYmRfY2pkY2RqYyoqKioqKiIKICB9Cn0="
}
```

## Request Parameters

| Parameter Name | Type | Description | Mandatory |
| --- | --- | --- | --- |
| *`merchantId`* | `STRING` | Unique `MerchantID` assigned to the merchant by PhonePe | `Yes` |
| *`subMerchantId`* | `STRING` | Unique identity of end merchant | `No` |
| *`storeId`* | `STRING` | Store Id of store. Should be `unique` across. Special characters like â â, â,â, â@â etc. are not allowed. Length should be lesser than `38 characters` | `Yes` |
| *`terminalId`* | `STRING` | Unique terminal Id for each POS device. Special characters like â â, â,â, â@â etc. are not allowed. Length should be lesser than `38 characters` | `No` |
| *`gstBreakup`* | `OBJECT` | Refer below for gstBreakup details | `No` |
| *`invoiceDetails`* | `OBJECT` | Refer below for invoice details | `No` |
| *`transactionId`* | `STRING` | Unique transactionId **Note**: â **TransactionId** length should be **less than 35** characters. Â  â No Special characters allowed except **underscore â\_â** and **hyphen â-â** | `Yes` |
| *`amount`* | `LONG` | Amount in Paise | `Yes` |
| *`expiresIn`* | `LONG` | Expiry time in seconds | `Yes` |
| *`merchantOrderId`* | `STRING` | OrderId. This can be same as transactionId | `No` |
| *`message`* | `STRING` | Message for customer | `No` |

## Request Parameters â GST Breakup Details

| Parameter Name | Type | Mandatory | Comments |
| --- | --- | --- | --- |
| *`gst`* | `LONG` | `No` | In Paise. Cannot be Negative. |
| *`cgst`* | `LONG` | `No` | In Paise.Cannot be Negative. |
| *`cess`* | `LONG` | `No` | In Paise.Cannot be Negative. |
| *`sgst`* | `LONG` | `No` | In Paise.Cannot be Negative. |
| *`igst`* | `LONG` | `No` | In Paise.Cannot be Negative. |
| *`gstIncentive`* | `LONG` | `No` | In Paise.Cannot be Negative. |
| *`gstPercentage`* | `DOUBLE` | `No` | Cannot be Negative. |

## Request Parameters â invoiceDetails

| Parameter Name | Type | Mandatory | Comments |
| --- | --- | --- | --- |
| *`invoiceNumber`* | `String` | `No` | Â |
| *`invoiceDate`* | `String` | `No` | Should be of the format 1970-01-01T05:30:00+05:30 |
| *`invoiceName`* | `String` | `No` | Â |

Sample Success Response

```
{
  "success": true,
  "code": "SUCCESS",
  "message": "Your request has been successfully completed.",
  "data": {
    "merchantId": "MERCHANTUAT",
    "transactionId": "TX32321849644234",
    "amount": 1000,
    "qrString": "upi://pay?pa=MERCHANTUAT@ybl&pn=Test%20MerchantTT&am=10.00&mam=10.00&tr=TX32321849644234&tn=Payment%20for%20TX32321849644234&mc=5311&mode=04&purpose=00&gstBrkUp=GST:1.0|CGST:0.25|SGST:0.25|IGST:0.25|CESS:0.25|GSTIncentive:1.0|GSTPCT:10.0&invoiceNo=123456fffff##_##&invoiceDate=2021-06-29T15:43:54+05:30&invoiceName=bccbd_cjdcdjc******"
  }
}
```

## Response Codes

| Code | Description |
| --- | --- |
| *`INVALID_TRANSACTION_ID`* | Duplicate TransactionID |
| *`BAD_REQUEST`* | Invalid request payload |
| *`AUTHORIZATION_FAILED`* | Incorrect X-VERIFY header |
| *`INTERNAL_SERVER_ERROR`* | Something went wrong |
| *`SUCCESS`* | API successful |

C# SampleCode

```
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Net;
using System.Text;
using System.Security.Cryptography;
using Newtonsoft.Json;

namespace Rextester
{
    public class Program
    {
        private const string PHONEPE_STAGE_BASE_URL = "https://mercury-uat.phonepe.com/enterprise-sandbox";
        private string merchantKey = "8289e078-be0b-484d-ae60-052f117f8deb";
        private const string merchantId = "M2306160483220675579140";
        private string transactionId = "mer_order_8";
        private int amount = 100;
        private string storeId = "store1";
        private string terminalId = "terminal1";
        private int expiresIn = 180;

        public bool SendPaymentRequest(){
            PhonePeCollectRequest phonePeCollectRequest = new PhonePeCollectRequest();

            phonePeCollectRequest.merchantId = merchantId;
            phonePeCollectRequest.transactionId = transactionId;
            phonePeCollectRequest.merchantOrderId = transactionId;
            phonePeCollectRequest.amount = amount;
            phonePeCollectRequest.expiresIn = expiresIn;
            phonePeCollectRequest.storeId = storeId;
            phonePeCollectRequest.terminalId = terminalId;

			//convert string to json
            String jsonStr = JsonConvert.SerializeObject(phonePeCollectRequest);
            Console.WriteLine(jsonStr);
            
            string base64Json = ConvertStringToBase64(jsonStr);
            Console.WriteLine(base64Json);
            string jsonSuffixString = "/v3/qr/init" + merchantKey;
            string checksum = GenerateSha256ChecksumFromBase64Json(base64Json, jsonSuffixString);
            checksum = checksum + "###1";
            Console.WriteLine(checksum);
            
            string txnURL = PHONEPE_STAGE_BASE_URL + "/v3/qr/init";
            Console.WriteLine("txnURL : " + txnURL);
            try
            {
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(txnURL);

                webRequest.Method = "POST";
                webRequest.ContentType = "application/json";
                webRequest.Headers.Add("x-verify", checksum);

                PhonePeCollectApiRequestBody phonePeCollectApiRequestBody = new PhonePeCollectApiRequestBody();
                phonePeCollectApiRequestBody.request = base64Json;
                String jsonBody = JsonConvert.SerializeObject(phonePeCollectApiRequestBody);

                using (StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream()))
                {
                    requestWriter.Write(jsonBody);
                }

                string responseData = string.Empty;

                using (StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream()))
                {
                    responseData = responseReader.ReadToEnd();
                    if (responseData.Length > 0)
                    {
                        //Dictionary<string, string> responseParam = JSONConvert.decode(responseData);
                        PhonePeCollectResponseBody responseBody = JsonConvert.DeserializeObject<PhonePeCollectResponseBody>(responseData);
                        Console.WriteLine(responseData);
                        Console.WriteLine(responseBody.message);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            
            return false;
        }
        
        public bool SendCheckPaymentStatusRequest()
        {
            string headerString = String.Format("/v3/transaction/{0}/{1}/status{2}", merchantId, transactionId, merchantKey);
            Console.WriteLine("headerString: " + headerString);
            string checksum = GenerateSha256ChecksumFromBase64Json("", headerString);
            checksum = checksum + "###1";
            Console.WriteLine(checksum);

            bool result = CallPhonePeStatusApi(checksum);

            return result;
        }
        
        private bool CallPhonePeStatusApi(String xVerify)
        {
            Console.WriteLine("CallPhonePeStatusApi()");
            string txnURL = PHONEPE_STAGE_BASE_URL;
            String urlSuffix = String.Format("/v3/transaction/{0}/{1}/status", merchantId, transactionId);
            txnURL = txnURL + urlSuffix;

            Console.WriteLine("Url: " + txnURL);
            
            try
            {
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(txnURL);

                webRequest.Method = "GET";
                webRequest.Headers.Add("x-verify", xVerify);

                string responseData = string.Empty;
                
                using (StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream()))
                {
                    responseData = responseReader.ReadToEnd();
                    if (responseData.Length > 0)
                    {
                        PhonePeCollectResponseBody responseBody = JsonConvert.DeserializeObject<PhonePeCollectResponseBody>(responseData);
                        Console.WriteLine(responseData);
                        Console.WriteLine(responseBody.message);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            return false;
        }
        
		//convert jsonBody to base64
        public string ConvertStringToBase64(string inputString)
        {
            string base64Json = null;
            byte[] requestBytes = Encoding.UTF8.GetBytes(inputString);
            base64Json = Convert.ToBase64String(requestBytes);
            return base64Json;
        }
		
		// calculte SHA256
        private string GenerateSha256ChecksumFromBase64Json(string base64JsonString, string jsonSuffixString)
        {
            string checksum = null;
            SHA256 sha256 = SHA256.Create();
            string checksumString = base64JsonString + jsonSuffixString;
            byte[] checksumBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(checksumString));
            //checksum = BitConverter.ToString(checksumBytes).Replace("-", string.Empty);
            foreach (byte b in checksumBytes) {
                checksum += $"{b:x2}";
            }
            return checksum;
        }

        public static void Main(string[] args){
            Program obj = new Program();
            bool QRResponse = obj.SendPaymentRequest();
            Console.WriteLine("QR Success");
            bool statusResponse = obj.SendCheckPaymentStatusRequest();
            Console.WriteLine("Payment status check");
        }
    }

    public class PhonePeCollectRequest
    {
        public string merchantId;
        public string transactionId;
        public string merchantOrderId;
        public int amount;
        public int expiresIn;
        public string storeId;
        public string terminalId;
    }

    public class PhonePeCollectApiRequestBody
    {
        public string request;
    }
    
    public class PhonePeCollectResponseBody
    {
        public bool success;
        public string code;
        public string message;
        public Data data;
    }
    public class Data
    {
        public string transactionId;
        public int amount;
        public string merchantId;
        public string providerReferenceId;
    }
}
```

JavaSampleCode

```
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.nio.charset.StandardCharsets;
import javax.xml.bind.DatatypeConverter;

public class DynamicQRApi 
{
    static String apiSaltKey = "369eaf8a-662f-4919-83f2-1dd8e01f2cad";
    static String urlEndpoint = apiSaltKey+ "/v3/qr/init";
	
	public static String GenerateSha256FromBase64Json(String base64Encoded, String urlEndpoint)
	{
		@SuppressWarnings("unused")
		String checksumString= base64Encoded+urlEndpoint;
		MessageDigest md = null;
		try 
		{
			md = MessageDigest.getInstance("SHA-256");
		} 
		catch (NoSuchAlgorithmException e) { e.printStackTrace(); }
	    //byte[] hash = md.digest(urlEndpoint.getBytes());
		md.update(checksumString.getBytes());
		byte[] byteData = md.digest();
		// Convert the byte array to a hexadecimal string
        StringBuilder checksum = new StringBuilder();
        for (byte b : byteData) 
        {
            checksum.append(String.format("%02x", b));
        }
	    return checksum.toString();
	}	
    @SuppressWarnings("null")
	public static void main(String[] args) throws Exception, IOException
    {
    	String apiUrl = "https://mercury-uat.phonepe.com/enterprise-sandbox/v3/qr/init";
    	
        // Request parameters
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("merchantId", "PATNAUAT");
        params.put("transactionId", "TX1234567890104");
        params.put("merchantOrderId", "M1234567013");
        params.put("amount", (long) 100);
        params.put("expiresIn", (long) 1800);
        params.put("storeId", "store1");
        params.put("terminalId", "terminal1");
        
        String jsonString = params.toString();
        byte[] encodedBytes = Base64.getEncoder().encode(jsonString.getBytes());
        String base64EncodedString = new String(encodedBytes);

        //creating X-verify
        String checksum = GenerateSha256FromBase64Json(base64EncodedString,urlEndpoint);
        checksum = checksum + "###1";
        try
        {
        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("X-verify", checksum);
        conn.setDoOutput(true);
        
        try (OutputStream os = conn.getOutputStream())
        {
        	byte[] input = base64EncodedString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }
        
        int responseCode = conn.getResponseCode();
        System.out.println("Response Code: " + responseCode);
        // Read the response from the server
        if (responseCode == HttpURLConnection.HTTP_OK) {
            try (InputStream is = conn.getInputStream()) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    System.out.write(buffer, 0, bytesRead);
                }
            }
        } else {
            // Handle error response here if needed
            System.err.println("Error Response: " + responseCode);
        }
     // Close the connection
        conn.disconnect();
    }
        catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

Python SampleCode

```
from django.shortcuts import render
from django.http import HttpResponse
import requests
import base64
import hashlib
from rest_framework.decorators import api_view
import json
from django.http import JsonResponse
import qrcode
import os

txnid = "TEST20231004021525T"
baseUrl = 'https://mercury-uat.phonepe.com/enterprise-sandbox'
MID = 'MERCHANTUAT'
saltkey = 'f1fed176-917c-4c1b-b5ae-1e1d39e1f8d5'
keyindex = '1'
def qrInit(request):
    url = baseUrl + '/v3/qr/init'

    payload = {
        'merchantId': MID,
        'transactionId': txnid,
        "merchantOrderId": "MO145001",  
        'amount': 100,
        'expiresIn': 180,
        "message": "Test",
        "subMerchant": "",
        "storeId": "store1"
        #"terminalId": "2190961",
        # "gstBreakup": {},
        # "invoiceDetails": {}
     }

    # for base64 encoded payload
    strjson = json.dumps(payload)
    encoded_dict = strjson.encode('UTF-8')
    encodeddata = base64.b64encode(encoded_dict)
    encodeddata = encodeddata.decode('UTF-8')
    data = {
        "request": encodeddata
    }
    print(url)
    print(json.dumps(data))
    # for Sha256 calculation
    # api_saltkey = '/v3/qr/init' + saltkey
    str_forSha256 = encodeddata + '/v3/qr/init' + saltkey
    sha_value = hashlib.sha256(str_forSha256.encode('UTF-8')).hexdigest()
    x_verify = sha_value + '###' + keyindex
    print(x_verify);

    headers = {
        "Content-Type": "application/json",
        #"x-callback-url": "https://webhook.site/83892277-ac4f-4bc8",
        # "X-REDIRECT-MODE": "POST",
        "x-call-mode":"POST",
        #"x-provider-id": "M24015632468732",
        "X-VERIFY": x_verify
    }
    print(headers)
    res = requests.post(url=url, data=json.dumps(data), headers=headers)
    return HttpResponse(res)
```
