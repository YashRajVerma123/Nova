
import * as admin from 'firebase-admin';

// This is a more robust way to handle the service account credentials,
// especially in environments like Vercel where multiline env vars can be tricky.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    if (!serviceAccountString) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error('Error parsing Firebase service account JSON:', error);
        throw new Error('Could not initialize Firebase Admin SDK. Service account JSON is malformed.');
    }
};

export { getAdminApp };
