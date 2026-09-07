import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserRole, 
  RoleType,
  User, 
  Listing, 
  Bid, 
  Transaction, 
  AppNotification, 
  LogisticsStatus,
  ListingStatus,
  MLMatchResult,
  MatchRecord
} from '../types';
import { evaluateMLMatches } from '../services/mlMatchingService';
import { 
  INITIAL_USERS, 
  INITIAL_LISTINGS, 
  INITIAL_BIDS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  updateDoc,
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface EcoNexusContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: UserRole; // Current active workspace mode
  activeWorkspaceMode: UserRole;
  setActiveWorkspaceMode: (mode: UserRole) => void;
  hasRole: (role: RoleType) => boolean;

  activePage: string;
  setActivePage: (page: string) => void;
  
  // Real Firebase Auth & Firestore Actions
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (userData: any) => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoAccount: (role: UserRole) => void;

  // Data Collections (All & Isolated)
  users: User[];
  listings: Listing[];
  bids: Bid[];
  transactions: Transaction[];
  notifications: AppNotification[];
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  
  // Isolated Data Getters
  getSellerListings: () => Listing[];
  getSellerBids: () => Bid[];
  getSellerTransactions: () => Transaction[];
  getBuyerBids: () => Bid[];
  getBuyerTransactions: () => Transaction[];
  getLogisticsShipments: () => Transaction[];
  getPublicListings: () => Listing[];

  // Toast Engine
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;

  // Interactivity Actions
  createListing: (newListingData: any) => Promise<Listing>;
  placeBid: (bidData: { listingId: string; offerPrice: number; quantity: number; message: string }) => Promise<void>;
  acceptBid: (bidId: string) => Promise<void>;
  rejectBid: (bidId: string) => Promise<void>;
  updateLogisticsStatus: (transactionId: string, nextStatus: LogisticsStatus) => Promise<void>;
  toggleUserVerification: (userId: string) => void;
  toggleListingStatus: (listingId: string, status: ListingStatus) => void;
  resetDemoData: () => void;

  runMLMatch: (listing: Partial<Listing>) => MLMatchResult[];
}

const EcoNexusContext = createContext<EcoNexusContextType | undefined>(undefined);

export const EcoNexusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication & Multi-Role Workspace State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<UserRole>('seller');
  const [activePage, setActivePage] = useState<string>('landing');
  
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentRole: UserRole = currentUser ? activeWorkspaceMode : 'guest';

  const hasRole = (targetRole: RoleType): boolean => {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.includes(targetRole) || currentUser.roles.includes('ADMIN');
  };

  const fetchRealFirebaseData = async () => {
    try {
      const [listingsSnap, bidsSnap, txSnap, usersSnap, notifSnap] = await Promise.all([
        getDocs(collection(db, 'listings')),
        getDocs(collection(db, 'bids')),
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'notifications'))
      ]);

      const realListings: Listing[] = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
      const realBids: Bid[] = bidsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Bid));
      const realTx: Transaction[] = txSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      const realUsers: User[] = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      const realNotifs: AppNotification[] = notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));

      setListings(realListings);
      setBids(realBids);
      setTransactions(realTx);
      setUsers(realUsers);
      setNotifications(realNotifs);
    } catch (err) {
      console.warn('Real Firestore collection sync notice:', err);
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const parsedRoles: RoleType[] = Array.isArray(data.roles) && data.roles.length > 0 
            ? data.roles.map((r: string) => r.toUpperCase() as RoleType)
            : [(data.role ? data.role.toUpperCase() : 'BUYER') as RoleType];

          const primaryRole: UserRole = (parsedRoles[0].toLowerCase() as UserRole);

          const profile: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: data.contactPerson || data.name || firebaseUser.displayName || 'Business Contact',
            company: data.businessName || data.company || 'Registered Enterprise',
            email: firebaseUser.email || data.email,
            roles: parsedRoles,
            role: primaryRole,
            phone: data.phone || '',
            location: data.location || '',
            industry: data.industry || '',
            description: data.description || '',
            verificationStatus: data.verificationStatus || 'verified',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            memberSince: data.createdAt ? new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt).toLocaleDateString() : 'Sep 2026'
          };
          setCurrentUser(profile);
          setActiveWorkspaceMode(primaryRole);
          setIsAuthenticated(true);
        }
        await fetchRealFirebaseData();
      } else {
        await fetchRealFirebaseData();
      }
    });

    return () => unsubscribe();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth: Login via Firebase Auth + Cloud Firestore `users/{uid}`
  const login = async (email: string, password?: string): Promise<boolean> => {
    if (password) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', userCred.user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const parsedRoles: RoleType[] = Array.isArray(data.roles) && data.roles.length > 0 
            ? data.roles.map((r: string) => r.toUpperCase() as RoleType)
            : [(data.role ? data.role.toUpperCase() : 'BUYER') as RoleType];

          const primaryRole: UserRole = (parsedRoles[0].toLowerCase() as UserRole);

          const profile: User = {
            id: userCred.user.uid,
            uid: userCred.user.uid,
            name: data.contactPerson || data.name || 'Business Contact',
            company: data.businessName || data.company || 'Registered Enterprise',
            email: email,
            roles: parsedRoles,
            role: primaryRole,
            phone: data.phone || '',
            location: data.location || '',
            industry: data.industry || '',
            verificationStatus: data.verificationStatus || 'verified',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            memberSince: 'Sep 2026'
          };
          setCurrentUser(profile);
          setActiveWorkspaceMode(primaryRole);
          setIsAuthenticated(true);
          setActivePage('dashboard');
          addToast(`Authenticated via Firebase as ${profile.company}`, 'success');
          return true;
        }
      } catch (err: any) {
        console.warn('Firebase Auth sign in notice:', err.message);
      }
    }

    addToast('Invalid email or password. Please check your credentials.', 'error');
    return false;
  };

  // Auth: Sign Up Business Registration (Supports Multi-Role roles array e.g. ["SELLER", "BUYER"])
  const signup = async (userData: any): Promise<User | null> => {
    const selectedRoles: RoleType[] = Array.isArray(userData.roles) && userData.roles.length > 0
      ? userData.roles.map((r: string) => r.toUpperCase() as RoleType)
      : [(userData.role ? userData.role.toUpperCase() : 'BUYER') as RoleType];

    if (selectedRoles.includes('ADMIN')) {
      addToast('Admin accounts cannot be registered publicly.', 'error');
      return null;
    }

    let uid = `user-${Date.now()}`;

    try {
      if (userData.email && userData.password) {
        const userCred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        uid = userCred.user.uid;

        // Write multi-role array `roles: ["SELLER", "BUYER"]` to Cloud Firestore `users/{uid}`
        const userDocRef = doc(db, 'users', uid);
        const userDocData = {
          uid,
          email: userData.email,
          roles: selectedRoles,
          businessName: userData.company || 'Registered Enterprise',
          contactPerson: userData.contactPerson || userData.name || 'Business Manager',
          phone: userData.phone || '',
          industry: userData.industry || 'Manufacturing',
          location: userData.location || 'Andhra Pradesh',
          description: userData.description || '',
          avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verificationStatus: 'verified',
          createdAt: serverTimestamp()
        };

        await setDoc(userDocRef, userDocData);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMsg = 'Failed to create business account.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      addToast(errorMsg, 'error');
      throw err;
    }

    const primaryRole = selectedRoles[0].toLowerCase() as UserRole;

    const newUser: User = {
      id: uid,
      uid,
      name: userData.contactPerson || userData.name || 'Business Manager',
      company: userData.company || 'Registered Enterprise',
      email: userData.email,
      roles: selectedRoles,
      role: primaryRole,
      phone: userData.phone || '+91 90000 00000',
      location: userData.location || 'Andhra Pradesh',
      industry: userData.industry || 'Manufacturing',
      verificationStatus: 'verified',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      memberSince: 'Sep 2026',
      materialsOfInterest: userData.materialsOfInterest || [],
      monthlyDemand: userData.monthlyDemand || ''
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setActiveWorkspaceMode(primaryRole);
    setIsAuthenticated(true);
    setActivePage('dashboard');

    addToast(`Business account created for ${newUser.company} with roles [${selectedRoles.join(', ')}]!`, 'success');
    return newUser;
  };

  // Auth: Password Reset Flow
  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      addToast(`Password reset email sent to ${email} via Firebase Auth.`, 'success');
    } catch (err: any) {
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.message) {
        msg = err.message;
      }
      addToast(msg, 'error');
    }
  };

  // Auth: Logout
  const logout = async (): Promise<void> => {
    await signOut(auth);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActivePage('landing');
    setSelectedListing(null);
    setSelectedTransaction(null);
    addToast('Logged out of workspace.', 'info');
  };

  // User Profile Update (Persists to Firestore users/{uid})
  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    if (currentUser.uid) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          company: updatedUser.company,
          businessName: updatedUser.company,
          industry: updatedUser.industry,
          location: updatedUser.location,
          avatar: updatedUser.avatar,
          materialsOfInterest: updatedUser.materialsOfInterest || [],
          monthlyDemand: updatedUser.monthlyDemand || '',
          updatedAtServer: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore user doc update notice:', e);
      }
    }
  };

  // Account Switcher
  const switchDemoAccount = (role: UserRole) => {
    if (role === 'guest') {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActivePage('landing');
      addToast('Switched to Public Unauthenticated View', 'info');
      return;
    }

    const found = users.find(u => u.roles.map(r => r.toLowerCase()).includes(role));
    if (found) {
      setCurrentUser(found);
      setActiveWorkspaceMode(role);
      setIsAuthenticated(true);
      setActivePage('dashboard');
      addToast(`Session set to: ${found.company} (${role.toUpperCase()})`, 'info');
    } else {
      addToast(`No registered ${role.toUpperCase()} account found in Firestore. Please register or sign in.`, 'info');
    }
  };

  // Isolated Data Getters based on active role capabilities
  const getSellerListings = () => {
    if (!currentUser || (!hasRole('SELLER') && !hasRole('ADMIN'))) return [];
    if (hasRole('ADMIN')) return listings;
    return listings.filter(l => l.sellerId === currentUser.id);
  };

  const getSellerBids = () => {
    if (!currentUser || (!hasRole('SELLER') && !hasRole('ADMIN'))) return [];
    if (hasRole('ADMIN')) return bids;
    return bids.filter(b => b.sellerId === currentUser.id);
  };

  const getSellerTransactions = () => {
    if (!currentUser || (!hasRole('SELLER') && !hasRole('ADMIN'))) return [];
    if (hasRole('ADMIN')) return transactions;
    return transactions.filter(t => t.sellerId === currentUser.id);
  };

  const getBuyerBids = () => {
    if (!currentUser || (!hasRole('BUYER') && !hasRole('ADMIN'))) return [];
    if (hasRole('ADMIN')) return bids;
    return bids.filter(b => b.buyerId === currentUser.id);
  };

  const getBuyerTransactions = () => {
    if (!currentUser || (!hasRole('BUYER') && !hasRole('ADMIN'))) return [];
    if (hasRole('ADMIN')) return transactions;
    return transactions.filter(t => t.buyerId === currentUser.id);
  };

  const getLogisticsShipments = () => {
    if (!currentUser || (!hasRole('LOGISTICS') && !hasRole('ADMIN'))) return [];
    if (hasRole('ADMIN')) return transactions;
    return transactions.filter(t => 
      t.logisticsId === currentUser.uid || 
      t.logisticsId === currentUser.id || 
      t.logisticsPartner === currentUser.company || 
      !t.logisticsId ||
      t.logisticsId === 'user-logistics-1'
    );
  };

  const getPublicListings = () => {
    return listings.filter(l => l.status === 'active' || l.status === 'bidding');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ML Engine Simulator
  const runMLMatch = (listingData: Partial<Listing>): MLMatchResult[] => {
    const isTextile = listingData.category === 'Textiles & Fabric' || listingData.title?.toLowerCase().includes('cotton');
    
    return [
      {
        buyerId: 'user-buyer-1',
        buyerName: 'Suresh Kumar',
        buyerCompany: 'Comfort Cushion Works',
        buyerIndustry: 'Furniture & Home Upholstery',
        buyerLocation: 'Vijayawada, AP (95 km away)',
        matchPercentage: isTextile ? 92 : 74,
        distanceKm: 95,
        materialRequirement: 'Cotton fabric clippings & scrap for cushion filling',
        matchReasons: [
          `${isTextile ? '92%' : '74%'} AI Match Confidence`,
          'Same regional industrial hub (Andhra Pradesh Corridor)',
          'Buyer process accepts raw trimmed textile waste',
          'Batch quantity matches buyer\'s weekly demand volume'
        ]
      },
      {
        buyerId: 'user-buyer-2',
        buyerName: 'Anil Mehta',
        buyerCompany: 'GreenThread Recycling Mills',
        buyerIndustry: 'Yarn & Fiber Recycling',
        buyerLocation: 'Guntur, AP (130 km away)',
        matchPercentage: isTextile ? 88 : 68,
        distanceKm: 130,
        materialRequirement: 'High-grade cellulose waste for respinning yarn',
        matchReasons: [
          `${isTextile ? '88%' : '68%'} AI Match Confidence`,
          'Requirement match: Clean un-dyed waste flakes/offcuts',
          'Buyer actively buying in this category'
        ]
      }
    ];
  };

  // Create Listing: Persists to Cloud Firestore `listings/{listingId}` and evaluates real ML matches
  const createListing = async (newListingData: any): Promise<Listing> => {
    if (!currentUser || (!hasRole('SELLER') && !hasRole('ADMIN'))) {
      throw new Error('Unauthorized: Seller role required to create listings');
    }
    const listingId = `lst-${Date.now()}`;

    // Ensure we have current real users from Firestore for candidate buyer evaluation
    let currentUsersPool = users;
    if (!currentUsersPool || currentUsersPool.length === 0) {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        currentUsersPool = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        setUsers(currentUsersPool);
      } catch (err) {
        console.warn('Could not fetch latest users for ML candidate evaluation:', err);
      }
    }

    const listingPartial: Partial<Listing> = {
      id: listingId,
      title: newListingData.title || 'Industrial Waste Listing',
      category: newListingData.category || 'Textiles & Fabric',
      subType: newListingData.subType || 'Cotton Offcuts',
      quantity: Number(newListingData.quantity) || 100,
      unit: newListingData.unit || 'kg',
      condition: newListingData.condition || 'Grade A (Sorted & Clean)',
      description: newListingData.description || '',
      sellerId: currentUser.id,
      location: newListingData.location || currentUser.location
    };

    // 1. Evaluate ML matches against REAL registered Firebase buyers
    const mlResponse = await evaluateMLMatches(listingPartial, currentUsersPool);
    const matches: MLMatchResult[] = mlResponse.matches || [];

    const newListing: Listing = {
      id: listingId,
      title: listingPartial.title!,
      category: listingPartial.category!,
      subType: listingPartial.subType!,
      quantity: listingPartial.quantity!,
      unit: listingPartial.unit!,
      condition: listingPartial.condition!,
      description: listingPartial.description!,
      images: newListingData.images && newListingData.images.length > 0 ? newListingData.images : [
        'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=80'
      ],
      location: listingPartial.location!,
      region: 'Andhra Pradesh',
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerCompany: currentUser.company,
      expectedPrice: Number(newListingData.expectedPrice) || 45,
      currentBidsCount: 0,
      highestBid: null,
      createdAt: new Date().toISOString(),
      status: 'active',
      specifications: {
        composition: newListingData.composition || '100% Industrial Grade',
        moistureContent: newListingData.moistureContent || '< 5%',
        contaminationRate: newListingData.contaminationRate || '< 0.5%',
        packagingType: newListingData.packagingType || 'Burlap Bales'
      },
      mlMatches: matches
    };

    // 2. Save Listing document to Cloud Firestore `listings/{listingId}`
    const listingDocRef = doc(db, 'listings', listingId);
    await setDoc(listingDocRef, {
      ...newListing,
      createdAtServer: serverTimestamp()
    });

    // 3. IDEMPOTENT MATCH PERSISTENCE: Save each match record to Firestore `matches/match_{listingId}_{buyerId}`
    if (matches.length > 0) {
      for (const match of matches) {
        try {
          const matchId = `match_${listingId}_${match.buyerId}`;
          const matchDocRef = doc(db, 'matches', matchId);
          const matchRecord: MatchRecord = {
            id: matchId,
            listingId: listingId,
            buyerId: match.buyerId,
            sellerId: currentUser.id,
            matchScore: match.matchPercentage,
            matchReasons: match.matchReasons,
            createdAt: new Date().toISOString()
          };
          await setDoc(matchDocRef, matchRecord);
        } catch (matchErr) {
          console.warn('Notice writing match document to Firestore:', matchErr);
        }
      }
    }

    setListings(prev => [newListing, ...prev]);

    if (mlResponse.status === 'unavailable') {
      addToast(`Listing created! ML matching service is currently offline.`, 'info');
    } else if (mlResponse.status === 'empty') {
      addToast(`Listing published to Cloud Firestore! No matching buyers currently in system.`, 'success');
    } else {
      addToast(`Listing published! ML service identified ${matches.length} compatible buyer matches.`, 'success');

      if (matches.length > 0) {
        const topMatch = matches[0];
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}`,
            targetRole: 'buyer',
            title: `${topMatch.matchPercentage}% ML Material Match Found!`,
            message: `New listing "${newListing.title}" in ${newListing.location} matches your requirements.`,
            time: 'Just now',
            read: false,
            type: 'match',
            actionPath: 'discover'
          },
          ...prev
        ]);
      }
    }

    return newListing;
  };

  // Place Bid: Persists to Cloud Firestore `bids/{bidId}`
  const placeBid = async (bidData: { listingId: string; offerPrice: number; quantity: number; message: string }): Promise<void> => {
    if (!currentUser || (!hasRole('BUYER') && !hasRole('ADMIN'))) {
      throw new Error('Unauthorized: Buyer role required to place bids');
    }
    const listing = listings.find(l => l.id === bidData.listingId);
    if (!listing) return;

    const bidId = `bid-${Date.now()}`;
    const totalAmount = bidData.offerPrice * bidData.quantity;

    const newBid: Bid = {
      id: bidId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0],
      category: listing.category,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerCompany: listing.sellerCompany,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerCompany: currentUser.company,
      buyerLocation: currentUser.location,
      offerPrice: bidData.offerPrice,
      quantity: bidData.quantity,
      unit: listing.unit,
      totalAmount,
      matchScore: 92,
      message: bidData.message || 'We are interested in procuring this material lot.',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const bidDocRef = doc(db, 'bids', bidId);
    await setDoc(bidDocRef, {
      ...newBid,
      createdAtServer: serverTimestamp()
    });

    setBids(prev => [newBid, ...prev]);
    setListings(prev => prev.map(l => {
      if (l.id === listing.id) {
        const newCount = l.currentBidsCount + 1;
        const newHighest = Math.max(l.highestBid || 0, bidData.offerPrice);
        return { ...l, currentBidsCount: newCount, highestBid: newHighest, status: 'bidding' };
      }
      return l;
    }));

    addToast(`Bid persisted in Cloud Firestore bids/${bidId}!`, 'success');
  };

  // Accept Bid: Persists transaction to Cloud Firestore `transactions/{txId}` and shipment to `shipments/{shipmentId}`
  const acceptBid = async (bidId: string): Promise<void> => {
    const bid = bids.find(b => b.id === bidId);
    if (!bid) return;

    // Idempotency check: Prevent duplicate transactions if the same bid is accepted twice
    const existingTx = transactions.find(t => t.acceptedBidId === bidId || t.bidId === bidId);
    if (existingTx) {
      addToast(`Transaction ${existingTx.id} already exists for this bid.`, 'info');
      return;
    }

    const txId = `tx-${Date.now()}`;
    const shipmentId = `shp-${Date.now()}`;

    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'accepted' } : b.listingId === bid.listingId ? { ...b, status: 'rejected' } : b));
    setListings(prev => prev.map(l => l.id === bid.listingId ? { ...l, status: 'sold' } : l));

    const newTx: Transaction = {
      id: txId,
      transactionId: txId,
      listingId: bid.listingId,
      listingTitle: bid.listingTitle,
      category: bid.category,
      listingImage: bid.listingImage,
      bidId,
      acceptedBidId: bidId,
      sellerId: bid.sellerId,
      sellerName: bid.sellerName,
      sellerCompany: bid.sellerCompany,
      sellerLocation: 'Bhimavaram, AP',
      buyerId: bid.buyerId,
      buyerName: bid.buyerName,
      buyerCompany: bid.buyerCompany,
      buyerLocation: bid.buyerLocation,
      agreedPrice: bid.offerPrice,
      quantity: bid.quantity,
      unit: bid.unit,
      totalAmount: bid.totalAmount,
      logisticsPartner: 'Apex Industrial Freight Solutions',
      logisticsId: 'user-logistics-1',
      pickupAddress: `${bid.sellerCompany} Yard, Industrial Park, Bhimavaram`,
      deliveryAddress: `${bid.buyerCompany} Works, Autonagar, ${bid.buyerLocation}`,
      currentStatus: 'confirmed',
      scheduledPickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      estimatedDeliveryDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          stepKey: 'confirmed',
          title: 'Deal Confirmed',
          description: `Bid accepted by seller ${bid.sellerCompany}. Escrow locked.`,
          timestamp: new Date().toLocaleString(),
          completed: true,
          current: true
        },
        {
          stepKey: 'pickup_scheduled',
          title: 'Pickup Scheduled',
          description: 'Apex Industrial Freight assigned. Vehicle allocation pending.',
          timestamp: null,
          completed: false,
          current: false
        },
        {
          stepKey: 'picked_up',
          title: 'Material Picked Up',
          description: 'Weighbridge slip generated at seller facility.',
          timestamp: null,
          completed: false,
          current: false
        },
        {
          stepKey: 'in_transit',
          title: 'In Transit',
          description: 'Truck dispatched to buyer destination.',
          timestamp: null,
          completed: false,
          current: false
        },
        {
          stepKey: 'delivered',
          title: 'Delivered',
          description: 'Delivered to buyer facility & weight verified.',
          timestamp: null,
          completed: false,
          current: false
        },
        {
          stepKey: 'completed',
          title: 'Transaction Completed',
          description: 'Funds released to seller escrow.',
          timestamp: null,
          completed: false,
          current: false
        }
      ]
    };

    // Write Transaction to Firestore `transactions/{txId}`
    const txDocRef = doc(db, 'transactions', txId);
    await setDoc(txDocRef, {
      ...newTx,
      createdAtServer: serverTimestamp()
    });

    // Write Shipment to Firestore `shipments/{shipmentId}`
    const shipmentDocRef = doc(db, 'shipments', shipmentId);
    await setDoc(shipmentDocRef, {
      id: shipmentId,
      shipmentId,
      transactionId: txId,
      sellerId: bid.sellerId,
      buyerId: bid.buyerId,
      logisticsId: 'user-logistics-1',
      logisticsPartner: 'Apex Industrial Freight Solutions',
      pickupLocation: newTx.pickupAddress,
      deliveryLocation: newTx.deliveryAddress,
      status: 'confirmed',
      trackingEvents: [
        {
          id: `track-${Date.now()}`,
          status: 'confirmed',
          description: 'Deal confirmed. Shipment assigned to Apex Freight.',
          location: newTx.pickupAddress,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAtServer: serverTimestamp()
    });

    setTransactions(prev => [newTx, ...prev]);

    addToast(`Transaction ${txId} & Shipment ${shipmentId} persisted in Cloud Firestore!`, 'success');
  };

  const rejectBid = async (bidId: string): Promise<void> => {
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'rejected' } : b));
    const bidDocRef = doc(db, 'bids', bidId);
    await updateDoc(bidDocRef, { status: 'rejected' });
    addToast('Bid declined in Firestore.', 'info');
  };

  const updateLogisticsStatus = async (transactionId: string, nextStatus: LogisticsStatus): Promise<void> => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    const statusOrder: LogisticsStatus[] = [
      'confirmed',
      'pickup_scheduled',
      'picked_up',
      'in_transit',
      'delivered',
      'completed'
    ];

    const targetIdx = statusOrder.indexOf(nextStatus);

    const updatedTimeline = tx.timeline.map((step, idx) => {
      if (idx < targetIdx) {
        return { ...step, completed: true, current: false };
      } else if (idx === targetIdx) {
        return { ...step, completed: true, current: true, timestamp: step.timestamp || new Date().toLocaleString() };
      } else {
        return { ...step, completed: false, current: false };
      }
    });

    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          currentStatus: nextStatus,
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString(),
          vehicleNumber: t.vehicleNumber || 'AP 16 TJ 4521 (14ft Container)',
          driverContact: t.driverContact || '+91 98760 99887 (Ravi Kumar)'
        };
      }
      return t;
    }));

    if (selectedTransaction?.id === transactionId) {
      setSelectedTransaction(prev => prev ? {
        ...prev,
        currentStatus: nextStatus,
        timeline: updatedTimeline
      } : null);
    }

    const txDocRef = doc(db, 'transactions', transactionId);
    await updateDoc(txDocRef, {
      currentStatus: nextStatus,
      timeline: updatedTimeline,
      updatedAtServer: serverTimestamp()
    });

    // Update Shipment in Firestore `shipments` collection by transactionId
    try {
      const q = query(collection(db, 'shipments'), where('transactionId', '==', transactionId));
      const querySnap = await getDocs(q);
      querySnap.forEach(async (shipmentDoc) => {
        await updateDoc(shipmentDoc.ref, {
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          updatedAtServer: serverTimestamp()
        });
      });
    } catch (e) {
      console.warn('Shipment doc update notice:', e);
    }

    addToast(`Shipment status updated to "${nextStatus.replace('_', ' ').toUpperCase()}" in Firestore!`, 'success');
  };

  const toggleUserVerification = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const next = u.verificationStatus === 'verified' ? 'pending' : 'verified';
        addToast(`User ${u.company} verification status updated to ${next}`, 'info');
        return { ...u, verificationStatus: next };
      }
      return u;
    }));
  };

  const toggleListingStatus = (listingId: string, status: ListingStatus) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status } : l));
    addToast(`Listing status updated to ${status}`, 'info');
  };

  const resetDemoData = () => {
    fetchRealFirebaseData();
    setSelectedListing(null);
    setSelectedTransaction(null);
    addToast('Data resynced with live Cloud Firestore collections.', 'info');
  };

  return (
    <EcoNexusContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentRole,
        activeWorkspaceMode,
        setActiveWorkspaceMode,
        hasRole,
        activePage,
        setActivePage,
        login,
        signup,
        sendPasswordReset,
        updateUserProfile,
        logout,
        switchDemoAccount,
        users,
        listings,
        bids,
        transactions,
        notifications,
        selectedListing,
        setSelectedListing,
        selectedTransaction,
        setSelectedTransaction,
        getSellerListings,
        getSellerBids,
        getSellerTransactions,
        getBuyerBids,
        getBuyerTransactions,
        getLogisticsShipments,
        getPublicListings,
        toasts,
        addToast,
        removeToast,
        markNotificationRead,
        createListing,
        placeBid,
        acceptBid,
        rejectBid,
        updateLogisticsStatus,
        toggleUserVerification,
        toggleListingStatus,
        resetDemoData,
        runMLMatch,
      }}
    >
      {children}
    </EcoNexusContext.Provider>
  );
};

export const useEcoNexus = () => {
  const context = useContext(EcoNexusContext);
  if (!context) {
    throw new Error('useEcoNexus must be used within an EcoNexusProvider');
  }
  return context;
};
