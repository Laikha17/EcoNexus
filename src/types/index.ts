export type RoleType = 'SELLER' | 'BUYER' | 'LOGISTICS' | 'ADMIN';
export type UserRole = 'seller' | 'buyer' | 'logistics' | 'admin' | 'guest';

export interface User {
  id: string;
  uid?: string;
  name: string;
  contactPerson?: string;
  company: string;
  businessName?: string;
  email: string;
  roles: RoleType[];
  role: UserRole;
  phone: string;
  location: string;
  industry: string;
  description?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  avatar: string;
  memberSince: string;
  createdAt?: string;
  materialsOfInterest?: string[];
  monthlyDemand?: string;
}

export type MaterialCategory = 
  | 'Textiles & Fabric'
  | 'Plastics & Polymers'
  | 'Metals & Alloys'
  | 'Paper & Packaging'
  | 'Chemicals & Solvents'
  | 'Rubber & Tyres';

export type ListingStatus = 'draft' | 'active' | 'bidding' | 'sold' | 'archived';

export type MaterialCondition = 
  | 'Grade A (Sorted & Clean)'
  | 'Grade B (Mixed Offcuts)'
  | 'Raw Unsorted Scrap'
  | 'Shredded / Processed Flakes';

export interface MLMatchReason {
  score: number;
  label: string;
  detail: string;
}

export interface MLMatchResult {
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerIndustry: string;
  buyerLocation: string;
  matchPercentage: number;
  distanceKm: number;
  materialRequirement: string;
  matchReasons: string[];
}

export interface MatchRecord {
  id?: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  matchScore: number;
  matchReasons: string[];
  createdAt: string;
}

export interface Listing {
  id: string;
  listingId?: string;
  title: string;
  materialType?: string;
  category: MaterialCategory;
  subType: string;
  quantity: number;
  unit: string;
  condition: MaterialCondition;
  description: string;
  images: string[];
  location: string;
  region: string;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  expectedPrice: number;
  currentBidsCount: number;
  highestBid: number | null;
  createdAt: string;
  status: ListingStatus;
  mlMatches: MLMatchResult[];
  specifications: {
    composition: string;
    moistureContent: string;
    contaminationRate: string;
    packagingType: string;
  };
}

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface Bid {
  id: string;
  bidId?: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  category: MaterialCategory;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerLocation: string;
  offerPrice: number;
  amount?: number;
  unit: string;
  quantity: number;
  totalAmount: number;
  matchScore: number;
  message: string;
  createdAt: string;
  status: BidStatus;
}

export type LogisticsStatus = 
  | 'confirmed'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed';

export interface StatusTimelineStep {
  stepKey: LogisticsStatus;
  title: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
  current: boolean;
}

export interface TrackingEvent {
  id: string;
  status: LogisticsStatus;
  description: string;
  location: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  transactionId?: string;
  listingId: string;
  listingTitle: string;
  category: MaterialCategory;
  listingImage: string;
  bidId?: string;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  sellerLocation: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerLocation: string;
  agreedPrice: number;
  quantity: number;
  unit: string;
  totalAmount: number;
  status?: string;
  logisticsPartner: string;
  logisticsId?: string;
  acceptedBidId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  currentStatus: LogisticsStatus;
  timeline: StatusTimelineStep[];
  createdAt: string;
  updatedAt: string;
  scheduledPickupDate: string;
  estimatedDeliveryDate: string;
  driverContact?: string;
  vehicleNumber?: string;
}

export interface Shipment {
  id: string;
  shipmentId?: string;
  transactionId: string;
  sellerId: string;
  buyerId: string;
  logisticsId: string;
  logisticsPartner: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: LogisticsStatus;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  notificationId?: string;
  recipientId?: string;
  targetRole: UserRole;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'bid' | 'match' | 'logistics' | 'system' | 'admin';
  actionPath?: string;
  createdAt?: string;
}
