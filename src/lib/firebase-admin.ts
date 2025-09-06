
import * as admin from 'firebase-admin';

// Function to safely parse the service account from a base64 environment variable
const getServiceAccount = () => {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.');
    }
    try {
        const decodedServiceAccount = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        return JSON.parse(decodedServiceAccount);
    } catch (e) {
        console.error("Failed to parse Firebase service account.", e);
        throw new Error("Could not parse FIREBASE_SERVICE_ACCOUNT_BASE64. Make sure it's a valid base64 encoded JSON.");
    }
};

const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    return admin.initializeApp({
        credential: admin.credential.cert(getServiceAccount()),
    });
};

export { getAdminApp };
