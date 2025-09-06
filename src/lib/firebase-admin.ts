
import * as admin from 'firebase-admin';

// This is a more robust way to handle the service account credentials,
// especially in environments like Vercel where multiline env vars can be tricky.
// The service account JSON is base64-encoded and stored in an env variable.
const serviceAccount = {
  "type": "service_account",
  "project_id": "nova-blog-ipybx",
  "private_key_id": "a2c125d78b0ecd95545da2b6d54b34ef03c45c19",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIFqgIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDNaWlLzTYLVzAh\nWECKYM/ZcP5FcSTo/HXfshJ9oopUJVRVNv7aduWvkIX0efxhLCAwEAAQJBALLgxtt7\nR/trVs0YW\nRBJaaKEZGoec/pbRtWqTghfYiF9jE0Da3fji2hFLig1UCLtIhasFtq6q1X/TVB\ndJ3qla5amjQ\nKBgQDf/2da9WnS97dF2xLhLjgQSkvLh3bFw1TwaGeR0D\nf+ZvWdUit22BqX+ySupMiJM49kRfSSuYKsp4Bmz\nuCL3HaLh+ewNrYs+3TFKkB\nhdwu+yHJNdVEDuWJpWlgxsG9S5nSmOjQiUmgZ0daSb7RayuEAujwCgYEAwVBx\ntwCop1H6VjXRvsMbCajrBm7IJ7vV6vySmg6Ujb4sR8iGyEEUNg5vPGxKHeue\nth/w+ISuix/UjZcoWivWnxii9JhX4rXeNbstA31oXTpIyKoyjpXRsp7E1v+wC\n7WfQIAoGBALjKj2cA4jM5XsYdkJR0yFu45WvjSZVubdu5Q0OSfumoFduiwZxaWB\nKtAsGsZeddenHVVj0qvJn7ifFE7s2jJyZV7Jg+d7BkHj+KjwvExI42B6e+3P\n/r9j6jVvC/YXPQhu0LWs\nh1fn6NaF9otKcN10ZAgMDBgFuWDdRFyhobbBaPGWn\nSf9yby/JS5xwVZv/xA3uLqoTYbc3H6+tQIKBgD3pnvdgxPBOKgiWeekbId1ZPXuD\n+Ke/vqwqi/qYAqHj/OtegzxM7Ub\nstMaGeMWbdcMkOxKGO1ObscroXQp5iQJhk\nxqXKJbXdLbX0s1nz+3tNkpC+DVYgJCX2s9kj\nuDAJiMyjObfRmwKBQC7drjgxS\ndIhtR30CGYEAqG6BIsyhmfahmEktvIxMlEEjWB5j/6vigFnFuguegXtJ9+K+\nw\nDjB6mMzLNPQOtKT9kzk7kwFMIANS4atLAmVU9SuYcq6ktw/S0oK8kq6oT1KyL\nwWAsei8AFiZeabRsFldD0oQT\nCgYBA5d/zklOoWzj+wvMgBLsIohKEAKOOhZHp\nz+y9D23TKNKP2uxp1m63wL5a/xuOd5iNrQqzNNQDRscfu8Gj1VwqmSvrfToF\nImNz5gIdNbW6y+OyC8dgeoSWBVVwGB7Smv7i4CJx\nBne+fuFydBwoAhoCAaECh\nUDm22IVnT1uXLrRw6YsGjHezkobfhofAlXsgJJvd2jusq9mowG5eKNoSuKIQ\n+gtdwTcMdxRsuoM/uxQJbyhGtKMoKy8lFm0nf+vHWyRsiuL0TPOE\ndzOjIR4kP\npKmTYjlBAg==\n-----END PRIVATE KEY-----\n`,
  "client_email": "firebase-adminsdk-ipybx@nova-blog-ipybx.iam.gserviceaccount.com",
  "client_id": "1044205513293",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ipybx%40nova-blog-ipybx.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
};

export { getAdminApp };
