export interface CreateNotificationDto {
  notification_id?: string;
  notificationId?: string;
  package_name?: string;
  packageName?: string;
  title?: string;
  content?: string;
  text?: string;
  big_text?: string;
  bigText?: string;
  app_name?: string;
  appName?: string;
  timestamp?: string;
  has_transaction?: boolean;
  hasTransaction?: boolean;
  amount?: string;
  payer_name?: string;
  payerName?: string;
  transaction_type?: string;
  transactionType?: string;
  processing_time_ms?: number;
  tts_announced?: boolean;
  ttsAnnounced?: boolean;
  team_notification_sent?: boolean;
  teamNotificationSent?: boolean;
  processing_metadata?: Record<string, any>;
  notification_log_id?: number;
  userId?: string;
}
