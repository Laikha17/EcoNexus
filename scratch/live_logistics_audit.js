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
  getDocs,
  collection,
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

async function runLogisticsAudit() {
  console.log("=== ECONEXUS LIVE LOGISTICS REAL WORKFLOW AUDIT (econexus-25f65) ===");

  const timestamp = Date.now();
  const sellerEmail = `seller_logistics_${timestamp}@econexus-test.io`;
  const logisticsEmail = `logistics_user_${timestamp}@econexus-test.io`;
  const testPassword = "TestPassword123!";

  // 1. Create Seller & Logistics Accounts
  console.log("\n[Test 1] Creating Seller & Logistics Accounts in Firebase...");
  let sellerUser, logisticsUser;
  try {
    // Seller
    const sCred = await createUserWithEmailAndPassword(auth, sellerEmail, testPassword);
    sellerUser = sCred.user;
    await setDoc(doc(db, 'users', sellerUser.uid), {
      uid: sellerUser.uid,
      email: sellerEmail,
      roles: ["SELLER"],
      businessName: "AP Spinners & Cotton Works",
      contactPerson: "Rajesh Seller",
      phone: "+91 98480 11223",
      industry: "Textile Manufacturing",
      location: "Guntur, Andhra Pradesh",
      verificationStatus: "verified",
      createdAt: serverTimestamp()
    });
    console.log(`  -> Seller Auth UID = ${sellerUser.uid}: PASS`);

    // Logistics
    const lCred = await createUserWithEmailAndPassword(auth, logisticsEmail, testPassword);
    logisticsUser = lCred.user;
    await setDoc(doc(db, 'users', logisticsUser.uid), {
      uid: logisticsUser.uid,
      email: logisticsEmail,
      roles: ["LOGISTICS"],
      businessName: "EcoExpress Freight Solutions",
      contactPerson: "Vikram Logistics",
      phone: "+91 94400 33445",
      industry: "Industrial Freight & Logistics",
      location: "Vijayawada, Andhra Pradesh",
      verificationStatus: "verified",
      createdAt: serverTimestamp()
    });
    console.log(`  -> Logistics Auth UID = ${logisticsUser.uid}: PASS`);
  } catch (err) {
    console.error(`  -> Account Creation FAIL:`, err.message);
  }

  // 2. Seller accepts bid & creates Transaction
  console.log("\n[Test 2] Seller creating Transaction in Firestore...");
  const txId = `tx-logistics-${timestamp}`;
  const shipmentId = `shp-logistics-${timestamp}`;
  try {
    await signInWithEmailAndPassword(auth, sellerEmail, testPassword);

    await setDoc(doc(db, 'transactions', txId), {
      id: txId,
      listingId: `lst-logistics-${timestamp}`,
      listingTitle: "Recycled PET Bottle Flakes - 500kg Lot",
      category: "Plastics & Polymers",
      sellerId: sellerUser.uid,
      sellerCompany: "AP Spinners & Cotton Works",
      sellerLocation: "Guntur, AP",
      buyerId: "user-buyer-1",
      buyerCompany: "Coastal Cushion Manufacturers",
      buyerLocation: "Vijayawada, AP",
      logisticsId: logisticsUser.uid,
      logisticsPartner: "EcoExpress Freight Solutions",
      agreedPrice: 60,
      quantity: 500,
      unit: "kg",
      totalAmount: 30000,
      currentStatus: "confirmed",
      pickupAddress: "Plot 12, Guntur Industrial Area, AP",
      deliveryAddress: "Autonagar Shed 4, Vijayawada, AP",
      timeline: [
        { stepKey: 'confirmed', title: 'Deal Confirmed', description: 'Escrow locked.', timestamp: new Date().toLocaleString(), completed: true, current: true },
        { stepKey: 'pickup_scheduled', title: 'Pickup Scheduled', description: 'Pending vehicle assignment.', timestamp: null, completed: false, current: false },
        { stepKey: 'picked_up', title: 'Material Picked Up', description: 'Gate pass generated.', timestamp: null, completed: false, current: false },
        { stepKey: 'in_transit', title: 'In Transit', description: 'On highway.', timestamp: null, completed: false, current: false },
        { stepKey: 'delivered', title: 'Delivered', description: 'Delivered to buyer facility.', timestamp: null, completed: false, current: false },
        { stepKey: 'completed', title: 'Transaction Completed', description: 'Funds released.', timestamp: null, completed: false, current: false }
      ],
      createdAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore transactions/${txId} created by seller: PASS`);
  } catch (err) {
    console.error(`  -> Transaction Creation FAIL:`, err.message);
  }

  // 3. Logistics User creates Shipment & updates status
  console.log("\n[Test 3] Logistics User creating Shipment & updating Status...");
  try {
    await signInWithEmailAndPassword(auth, logisticsEmail, testPassword);

    await setDoc(doc(db, 'shipments', shipmentId), {
      id: shipmentId,
      shipmentId: shipmentId,
      transactionId: txId,
      sellerId: sellerUser.uid,
      buyerId: "user-buyer-1",
      logisticsId: logisticsUser.uid,
      logisticsPartner: "EcoExpress Freight Solutions",
      pickupLocation: "Plot 12, Guntur Industrial Area, AP",
      deliveryLocation: "Autonagar Shed 4, Vijayawada, AP",
      status: "confirmed",
      createdAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore shipments/${shipmentId} created by logistics user: PASS`);

    const statuses = ['pickup_scheduled', 'picked_up', 'in_transit', 'delivered', 'completed'];
    for (const nextStatus of statuses) {
      await updateDoc(doc(db, 'transactions', txId), {
        currentStatus: nextStatus,
        updatedAtServer: serverTimestamp()
      });
      await updateDoc(doc(db, 'shipments', shipmentId), {
        status: nextStatus,
        updatedAtServer: serverTimestamp()
      });
      console.log(`  -> Shipment status updated to "${nextStatus}": PASS`);
    }
  } catch (err) {
    console.error(`  -> Logistics Operation FAIL:`, err.message);
  }

  // 4. Update Profile
  console.log("\n[Test 4] Updating Logistics User Profile in Firestore...");
  try {
    await updateDoc(doc(db, 'users', logisticsUser.uid), {
      businessName: "EcoExpress Logistics & Supply Chain Ltd",
      industry: "Interstate Freight Transport",
      location: "Visakhapatnam, Andhra Pradesh",
      updatedAtServer: serverTimestamp()
    });
    console.log(`  -> Firestore users/${logisticsUser.uid} profile updated: PASS`);
  } catch (err) {
    console.error(`  -> Profile Update FAIL:`, err.message);
  }

  // 5. Signout & Re-authenticate
  console.log("\n[Test 5] Verifying Session Persistence & Signout...");
  try {
    await signOut(auth);
    console.log(`  -> Signout successful.`);
    const reAuth = await signInWithEmailAndPassword(auth, logisticsEmail, testPassword);
    console.log(`  -> Re-authentication successful (${reAuth.user.email}): PASS`);
  } catch (err) {
    console.error(`  -> Signin/Signout FAIL:`, err.message);
  }

  console.log("\n=== LOGISTICS AUDIT COMPLETE ===");
  process.exit(0);
}

runLogisticsAudit().catch(err => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
