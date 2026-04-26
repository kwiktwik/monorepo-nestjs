<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/java-be-sdk/sdk-reference-java/installation -->

# Java SDK Installation

---

Integrating the **PhonePe Java SDK(v 2.2.2)** into your website is the first step toward enabling secure and reliable digital payments. The SDK supports creation of separate client instances for each set of credentials including client ID, client secret and client version. The SDK maintains a list of initialized instances, and if the same credentials are used again, it returns the existing instance instead of creating a new one or throwing an exception.

To get started, add the SDK to your project using your preferred build tool: Maven or Gradle as shown below.

## For Maven Users

- Open your project’s `pom.xml` file.
- Add the following dependency to include the SDK:

Code Reference

```
<dependency>
    <groupId>com.phonepe</groupId>
    <artifactId>pg-sdk-java</artifactId>
    <version>2.2.2</version>
</dependency>
```

## For Gradle Users

- Open your project’s **`build.gradle`** file.
- In the repositories section, include the pg-sdk-java JAR in your dependencies.

Code Reference

```
dependencies {
    implementation 'com.phonepe:pg-sdk-java:2.2.2'
}
```

## What’s Next?

Now that you’ve added the Java SDK to your project, the next step is to initialize the required classes.

Head over to the Class Initialization section to learn how to set it up properly.
