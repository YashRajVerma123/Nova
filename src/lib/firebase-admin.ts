
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccount) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your .env file.');
}

const serviceAccountJson = JSON.parse(serviceAccount);

const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
    });
};

export { getAdminApp };
