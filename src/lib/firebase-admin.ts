
import * as admin from 'firebase-admin';

// This is a more robust way to handle the service account credentials,
// especially in environments where multiline env vars can be tricky.
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    if (!serviceAccountBase64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.');
    }

    try {
        const decodedString = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decodedString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error('Error parsing Firebase service account JSON from base64:', error);
        throw new Error('Could not initialize Firebase Admin SDK. Service account JSON is malformed.');
    }
};

export { getAdminApp };
