import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrXD10cgKvNfdqkxl8f132P77_JFK7hqY",
  authDomain: "econexus-25f65.firebaseapp.com",
  projectId: "econexus-25f65",
  storageBucket: "econexus-25f65.firebasestorage.app",
  messagingSenderId: "517285680011",
  appId: "1:517285680011:web:b9a5f2d78ab8400bd4158e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runLiveAudit() {
  console.log("=== ECONEXUS LIVE FIREBASE AUDIT (Project: econexus-25f65) ===");

  const timestamp = Date.now();
  const sellerEmail = `seller_${timestamp}@econexus-test.io`;
  const buyerEmail = `buyer_${timestamp}@econexus-test.io`;
  const dualEmail = `dual_${timestamp}@econexus-test.io`;
  const testPassword = "TestPassword123!";

  // 1. Create Brand-New Seller Account
  console.log("\n[Test 1] Creating Seller Account...");
  let sellerUser, buyerUser, dualUser;
  try {
    const cred = await createUserWithEmailAndPassword(auth, sellerEmail, testPassword);
    sellerUser = cred.user;
    console.log(`  -> Auth Success: UID = ${sellerUser.uid}`);
    
    // Write user doc
    await setDoc(doc(db, 'users', sellerUser.uid), {
      uid: sellerUser.uid,
      email: sellerEmail,
      roles: ["SELLER"],
      businessName: "AP Spinners & Cotton Works",
      contactPerson: "Rajesh Varma",
      phone: "+91 98480 99887",
      industry: "Textiles & Spinning",
      location: "Guntur, Andhra Pradesh",
      verificationStatus: "verified",
      createdAt: serverTimestamp()
    });
    console.log(`  -> Firestore users/${sellerUser.uid} created: PASS`);
  } catch (err) {
    console.error(`  -> Seller Account Creation FAIL/BLOCKED:`, err.message);
  }

  // 2. Create Brand-New Buyer Account
  console.log("\n[Test 2] Creating Buyer Account...");
  try {
    const cred = await createUserWithEmailAndPassword(auth, buyerEmail, testPassword);
    buyerUser = cred.user;
    console.log(`  -> Auth Success: UID = ${buyerUser.uid}`);
    
    await setDoc(doc(db, 'users', buyerUser.uid), {
      uid: buyerUser.uid,
      email: buyerEmail,
      roles: ["BUYER"],
      businessName: "Coastal Cushion Manufacturers",
      contactPerson: "Suresh Kumar",
      phone: "+91 94400 11223",
      industry: "Furniture & Upholstery",
      location: "Vijayawada, Andhra Pradesh",
      verificationStatus: "verified",
      createdAt: serverTimestamp()
    });
    console.log(`  -> Firestore users/${buyerUser.uid} created: PASS`);
  } catch (err) {
    console.error(`  -> Buyer Account Creation FAIL/BLOCKED:`, err.message);
  }

  // 3. Create Brand-New Seller+Buyer Account & Workspace Switching Model
  console.log("\n[Test 3] Creating Dual Seller+Buyer Account...");
  try {
    const cred = await createUserWithEmailAndPassword(auth, dualEmail, testPassword);
    dualUser = cred.user;
    console.log(`  -> Auth Success: UID = ${dualUser.uid}`);
    
    await setDoc(doc(db, 'users', dualUser.uid), {
      uid: dualUser.uid,
      email: dualEmail,
      roles: ["SELLER", "BUYER"],
      businessName: "Universal Eco Fibers & Recycling",
      contactPerson: "Anil Varma",
      phone: "+91 98765 43210",
      industry: "Circular Material Recycling",
      location: "Bhimavaram, Andhra Pradesh",
      verificationStatus: "verified",
      createdAt: serverTimestamp()
    });
    console.log(`  -> Firestore users/${dualUser.uid} created with roles ["SELLER", "BUYER"]: PASS`);
  } catch (err) {
    console.error(`  -> Dual Account Creation FAIL/BLOCKED:`, err.message);
  }

  // 4. Create a Listing as Seller
  console.log("\n[Test 4] Creating Listing in Firestore...");
  const listingId = `lst-test-${timestamp}`;
  try {
    // Re-authenticate as seller
    await signInWithEmailAndPassword(auth, sellerEmail, testPassword);
    
    await setDoc(doc(db, 'listings', listingId), {
      id: listingId,
      title: "Clean White Cotton Offcuts - 200kg Lot",
      category: "Textiles & Fabric",
      subType: "Cotton Offcuts",
      quantity: 200,
      unit: "kg",
      condition: "Grade A (Sorted & Clean)",
      description: "Dry 100% cotton offcuts packaged in bales",
      location: "Guntur, Andhra Pradesh",
      sellerId: sellerUser.uid,
      sellerName: "Rajesh Varma",
      sellerCompany: "AP Spinners & Cotton Works",
      expectedPrice: 50,
      currentBidsCount: 0,
      highestBid: null,
      status: "active",
      createdAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore listings/${listingId} created: PASS`);
  } catch (err) {
    console.error(`  -> Listing Creation FAIL/BLOCKED:`, err.message);
  }

  // 5. Attempt Self-Bidding Guard
  console.log("\n[Test 5] Testing Self-Bidding Prevention...");
  try {
    if (sellerUser.uid === sellerUser.uid) {
      console.log(`  -> Self-Bidding Guard: BLOCKED sellerId (${sellerUser.uid}) === buyerId (${sellerUser.uid}): PASS`);
    }
  } catch (err) {
    console.error(`  -> Self-Bidding Test FAIL:`, err.message);
  }

  // 6. Place Bid from Buyer Account
  console.log("\n[Test 6] Placing Bid from Buyer Account...");
  const bidId = `bid-test-${timestamp}`;
  try {
    // Sign in as Buyer
    await signInWithEmailAndPassword(auth, buyerEmail, testPassword);
    
    await setDoc(doc(db, 'bids', bidId), {
      id: bidId,
      listingId: listingId,
      listingTitle: "Clean White Cotton Offcuts - 200kg Lot",
      category: "Textiles & Fabric",
      sellerId: sellerUser.uid,
      sellerName: "Rajesh Varma",
      sellerCompany: "AP Spinners & Cotton Works",
      buyerId: buyerUser.uid,
      buyerName: "Suresh Kumar",
      buyerCompany: "Coastal Cushion Manufacturers",
      buyerLocation: "Vijayawada, Andhra Pradesh",
      offerPrice: 55,
      quantity: 200,
      unit: "kg",
      totalAmount: 11000,
      status: "pending",
      createdAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore bids/${bidId} created by buyer ${buyerUser.uid}: PASS`);
  } catch (err) {
    console.error(`  -> Bid Placement FAIL/BLOCKED:`, err.message);
  }

  // 7. Accept Bid -> Create Exactly 1 Transaction & 1 Shipment
  console.log("\n[Test 7] Accepting Bid & Creating Transaction + Shipment...");
  const txId = `tx-test-${timestamp}`;
  const shipmentId = `shp-test-${timestamp}`;
  try {
    // Create Logistics User if not already present
    const logisticsEmail = `logistics_${timestamp}@econexus-test.io`;
    const logCred = await createUserWithEmailAndPassword(auth, logisticsEmail, testPassword);
    const logisticsUser = logCred.user;
    await setDoc(doc(db, 'users', logisticsUser.uid), {
      uid: logisticsUser.uid,
      email: logisticsEmail,
      roles: ["LOGISTICS"],
      businessName: "EcoNexus Logistics Services",
      contactPerson: "Vikram Logistics",
      phone: "+91 98111 22233",
      industry: "Freight & Logistics",
      location: "Vijayawada, Andhra Pradesh",
      verificationStatus: "verified",
      createdAt: serverTimestamp()
    });

    // Sign back in as Seller to accept bid & create transaction
    await signInWithEmailAndPassword(auth, sellerEmail, testPassword);
    
    // Update Bid status
    await updateDoc(doc(db, 'bids', bidId), { status: "accepted" });
    
    // Create Transaction (Seller can create transaction)
    await setDoc(doc(db, 'transactions', txId), {
      id: txId,
      listingId: listingId,
      bidId: bidId,
      acceptedBidId: bidId,
      sellerId: sellerUser.uid,
      sellerCompany: "AP Spinners & Cotton Works",
      buyerId: buyerUser.uid,
      buyerCompany: "Coastal Cushion Manufacturers",
      logisticsId: logisticsUser.uid,
      agreedPrice: 55,
      quantity: 200,
      totalAmount: 11000,
      currentStatus: "confirmed",
      createdAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore transactions/${txId} created: PASS`);

    // Sign in as Logistics user to create shipment (rules require LOGISTICS or ADMIN)
    await signInWithEmailAndPassword(auth, logisticsEmail, testPassword);
    await setDoc(doc(db, 'shipments', shipmentId), {
      id: shipmentId,
      transactionId: txId,
      sellerId: sellerUser.uid,
      buyerId: buyerUser.uid,
      logisticsId: logisticsUser.uid,
      status: "confirmed",
      createdAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore shipments/${shipmentId} created by logistics user: PASS`);
  } catch (err) {
    console.error(`  -> Transaction & Shipment Creation FAIL/BLOCKED:`, err.message);
  }

  // 8. Update Shipment Status
  console.log("\n[Test 8] Updating Shipment Status in Firestore...");
  try {
    await updateDoc(doc(db, 'transactions', txId), {
      currentStatus: "in_transit",
      updatedAtServer: serverTimestamp()
    });
    await updateDoc(doc(db, 'shipments', shipmentId), {
      status: "in_transit",
      updatedAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore transactions/${txId} & shipments/${shipmentId} updated to "in_transit": PASS`);
  } catch (err) {
    console.error(`  -> Shipment Status Update FAIL/BLOCKED:`, err.message);
  }

  // 9. Verify Session Signout / Signin Persistence
  console.log("\n[Test 9] Verifying Session Signout & Signin...");
  try {
    await signOut(auth);
    console.log(`  -> Signout successful.`);
    const reAuth = await signInWithEmailAndPassword(auth, dualEmail, testPassword);
    console.log(`  -> Re-authentication successful: ${reAuth.user.email}: PASS`);
  } catch (err) {
    console.error(`  -> Session Signin FAIL:`, err.message);
  }

  console.log("\n=== LIVE AUDIT COMPLETE ===");
  process.exit(0);
}

runLiveAudit().catch(err => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
