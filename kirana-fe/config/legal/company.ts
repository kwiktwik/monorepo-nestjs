export const companyDefaults = {
  legalName: "LNPK Business Pvt Ltd",
  supportEmail: "support@kiranaapps.com",
  phone: "+91 8595404595",
  address: "11C 1st Main Road, HSR Layout, Bangalore 560102, India",
  website: "kiranaapps.com",
  country: "India",
} as const

export type CompanyConfig = typeof companyDefaults
