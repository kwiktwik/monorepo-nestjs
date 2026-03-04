/**
 * UPI App Package Name to App Name Mapping
 * Maps Android package names to friendly app display names
 */
export const UPI_APP_PACKAGE_MAPPING: Record<string, string> = {
  // PhonePe
  "com.phonepe.app": "PhonePe",
  
  // Google Pay
  "com.google.android.apps.nbu.paisa.user": "Google Pay",
  
  // Paytm
  "net.one97.paytm": "Paytm",
  
  // BHIM
  "in.org.npci.upiapp": "BHIM",
  
  // Amazon Pay
  "in.amazon.mShop.android.shopping": "Amazon Pay",
  
  // CRED
  "com.dreamplug.androidapp": "CRED",
  
  // MobiKwik
  "com.mobikwik_new": "MobiKwik",
  
  // Freecharge
  "com.freecharge.android": "Freecharge",
  
  // BharatPe
  "com.bharatpe.app": "BharatPe",
  
  // Navi
  "com.naviapp": "Navi",
  
  // super.money
  "money.super.payments": "super.money",
  
  // Jupiter
  "money.jupiter": "Jupiter",
  
  // ICICI iMobile
  "com.csam.icici.bank.imobile": "ICICI iMobile",
  
  // Axis Mobile
  "com.axis.mobile": "Axis Mobile",
  
  // YONO SBI
  "com.sbi.lotusintouch": "YONO SBI",
  
  // PayZapp
  "com.hdfcbank.payzapp": "PayZapp",
  
  // HDFC MobileBanking
  "com.snapwork.hdfc": "HDFC MobileBanking",
  
  // Kotak 811
  "com.kotak811mobilebankingapp.instantsavingsupiscanandpayrecharge": "Kotak 811",
  
  // slice
  "indwin.c3.shareapp": "slice",
  
  // Samsung Pay
  "com.samsung.android.spay": "Samsung Pay",
};

/**
 * Pattern-based mapping for partial package name matches
 * Used when exact package name match is not found
 */
export const UPI_APP_PATTERN_MAPPING: Record<string, string> = {
  phonepe: "PhonePe",
  paisa: "Google Pay",
  google: "Google Pay",
  gpay: "Google Pay",
  paytm: "Paytm",
  bhim: "BHIM",
  npci: "BHIM",
  amazon: "Amazon Pay",
  mobikwik: "MobiKwik",
  freecharge: "Freecharge",
  bharatpe: "BharatPe",
  navi: "Navi",
  "super.money": "super.money",
  jupiter: "Jupiter",
  icici: "ICICI iMobile",
  axis: "Axis Mobile",
  sbi: "YONO SBI",
  payzapp: "PayZapp",
  hdfc: "HDFC MobileBanking",
  kotak: "Kotak 811",
  slice: "slice",
  samsung: "Samsung Pay",
  cred: "CRED",
};

/**
 * Map package name to friendly app name
 * First tries exact match, then falls back to pattern matching
 */
export function getAppNameFromPackage(packageName: string): string {
  if (!packageName) {
    return "Unknown";
  }

  const normalized = packageName.toLowerCase();

  // First, try exact match
  if (UPI_APP_PACKAGE_MAPPING[packageName]) {
    return UPI_APP_PACKAGE_MAPPING[packageName];
  }

  // Then, try pattern matching
  for (const [pattern, appName] of Object.entries(UPI_APP_PATTERN_MAPPING)) {
    if (normalized.includes(pattern)) {
      return appName;
    }
  }

  // Fallback: return a formatted version of the package name
  return packageName.split(".").pop() || packageName;
}

