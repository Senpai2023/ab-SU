export type UserRole = 'admin' | 'officer' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  createdAt: string;
}

export type AlertCategory = 
  | 'SUSPENSION NOTICE'
  | 'HEAT ADVISORY'
  | 'RAINFALL ADVISORY'
  | 'AIR QUALITY'
  | 'CAMPUS EMERGENCY';

export type SuspensionScope = 'ALL CLASSES' | 'MORNING CLASSES' | 'AFTERNOON CLASSES';
export type HeatLevel = 'CAUTION' | 'EXTREME CAUTION' | 'DANGER';
export type RainfallLevel = 'YELLOW ADVISORY' | 'ORANGE ADVISORY' | 'RED ADVISORY';
export type AirQualityLevel = 'UNHEALTHY FOR SENSITIVE' | 'UNHEALTHY (PM2.5)' | 'VERY UNHEALTHY';
export type EmergencyType = 'CAMPUS EVACUATION' | 'POWER & UTILITIES' | 'SECURITY ADVISORY';

export type SubCategory = 
  | SuspensionScope 
  | HeatLevel 
  | RainfallLevel 
  | AirQualityLevel 
  | EmergencyType;

export type SmsMode = 'simulation' | 'production';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  subCategory: SubCategory;
  referenceUrl: string;
  memoNumber?: string;
  eventDate?: string;
  temperature?: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  status: 'sent' | 'delivering' | 'failed' | 'draft' | 'delivered_simulated';
  isSimulated?: boolean;
  recipientCount: number;
  deliverySuccessCount: number;
  deliveryRate: number; // percentage, e.g. 99.8
  smsSegments: number;
  gatewayUsed: 'semaphore' | 'twilio' | 'vonage' | 'simulation';
  targetColleges: string[];
}

export interface Recipient {
  id: string;
  studentId: string;
  fullName: string;
  phoneNumber: string; // e.g. +639171234567
  college: string;
  program: string;
  yearLevel: number;
  consentStatus: 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
  isActive: boolean;
  registeredAt: string;
}

export interface SmsGatewayConfig {
  mode: SmsMode; // 'simulation' (default) or 'production'
  provider: 'simulation' | 'semaphore' | 'twilio' | 'vonage';
  apiKey: string;
  senderName: string; // e.g. "CarSU-ALERT" or "Ab!SU"
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  simulationDelayMs: number;
}

export interface BroadcastFormState {
  category: AlertCategory;
  subCategory: SubCategory;
  memoNumber: string;
  referenceUrl: string;
  eventDate: string;
  temperature: string;
  customNotes: string;
  isCustomMessage: boolean;
  customMessageBody: string;
  targetCollege: string; // 'ALL' or specific
}
