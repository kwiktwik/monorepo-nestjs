import { companyDefaults, type CompanyConfig } from "./company"

export type AppFeatures = {
  notificationAccess?: boolean
  paymentTracking?: boolean
  voiceAlerts?: boolean
  fileSharing?: boolean
  cloudStorage?: boolean
}

export type AppConfig = {
  name: string
  description?: string
  company?: Partial<CompanyConfig>
  features?: AppFeatures
  customClauses?: {
    dataCollection?: string
    permissions?: string[]
    dataUsage?: string[]
  }
}

export const apps: Record<string, AppConfig> = {
  kiranaapps: {
    name: "Alert Soundbox",
    description: "Voice alerts for UPI payment notifications",
    features: {
      notificationAccess: true,
      paymentTracking: true,
      voiceAlerts: true,
    },
    customClauses: {
      dataCollection:
        "To provide voice alerts, our app processes notification data from your payment apps. This data is processed locally on your device.",
      permissions: [
        "Notification Access: To read UPI payment notifications and provide voice alerts",
        "Audio/Media: To play voice alerts",
        "Storage: To store payment history and preferences",
      ],
      dataUsage: [
        "Provide voice alerts for UPI payment notifications",
        "Track daily payment collections",
        "Improve app functionality and user experience",
        "Send app updates and important announcements",
      ],
    },
  },
  "alert-soundbox": {
    name: "Alert Soundbox",
    description: "Voice alerts for UPI payment notifications",
    features: {
      notificationAccess: true,
      paymentTracking: true,
      voiceAlerts: true,
    },
    customClauses: {
      dataCollection:
        "To provide voice alerts, our app processes notification data from your payment apps. This data is processed locally on your device.",
      permissions: [
        "Notification Access: To read UPI payment notifications and provide voice alerts",
        "Audio/Media: To play voice alerts",
        "Storage: To store payment history and preferences",
      ],
      dataUsage: [
        "Provide voice alerts for UPI payment notifications",
        "Track daily payment collections",
        "Improve app functionality and user experience",
        "Send app updates and important announcements",
      ],
    },
  },
  "alerts-soundbox": {
    name: "Alert Soundbox",
    description: "Voice alerts for UPI payment notifications",
    features: {
      notificationAccess: true,
      paymentTracking: true,
      voiceAlerts: true,
    },
    customClauses: {
      dataCollection:
        "To provide voice alerts, our app processes notification data from your payment apps. This data is processed locally on your device.",
      permissions: [
        "Notification Access: To read UPI payment notifications and provide voice alerts",
        "Audio/Media: To play voice alerts",
        "Storage: To store payment history and preferences",
      ],
      dataUsage: [
        "Provide voice alerts for UPI payment notifications",
        "Track daily payment collections",
        "Improve app functionality and user experience",
        "Send app updates and important announcements",
      ],
    },
  },
  jamun: {
    name: "Jamun",
    description: "Creator tools for content",
  },
}

export function getAppConfig(appSlug: string): AppConfig | undefined {
  return apps[appSlug]
}

export function getAppWithCompany(appSlug: string) {
  const app = apps[appSlug]
  if (!app) return null

  return {
    ...app,
    company: {
      ...companyDefaults,
      ...app.company,
    },
  }
}

export function getAllAppSlugs(): string[] {
  return Object.keys(apps)
}
