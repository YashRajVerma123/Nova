
import * as admin from 'firebase-admin';

const serviceAccount = {
  "type": "service_account",
  "project_id": "nova-blog-ipybx",
  "private_key_id": "f108bcc4057271cf8d6f5bdfe8c0666ec0080ae2",
  "private_key": process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWajnUAcGBOXgO\ntApIiG5hxBsRo/Uib4/2sDEvCY76lONFqvxW4oKa/8cYBIIqhZJMxI5wNQQbNcGk\n8ocLRnYW4vQ+UyMPZ6t8tRyPe+lX6M72zGXhVL7I6Q1x2Uo+cc2lUFlf4RxoPbEz\nFMk2IpcHQCI0udngkAihtq9YHNybw7Y+ksaho3g7mKUrAgYS9VUQmdpfL2+IJvRR\nlmVYLmQcJAPoa+A7+YM54ld+5lZQn7MwcWcZry3QvvJNMlgYcTdX9hNVhYTIux+6\nmEsKsqYZZV+QvfElQYPIbDcZK5Xgs1g/VaveWkUOz97/YpNVOEKji/NTrDtyOKdH\nWOEGuYa1AgMBAAECggEAFG7kGumd7Lgy0kfjEP17c3KyV7CFzGXQVOR+k2p4RzYI\nIJwGVytX4fiNGyNW2kGHayxyHIxY21T4osUADJmG6HBxcT0QAshQ5d4Gnj/jQV7s\n1kUtUld2pQPcpaRc+G10+ROaqNH1mJOEfwc0k6WhOe4pNFgfxNBFGlAkDqQVe/xy\nhOdXMFnyAJxE6rg45K9vnsqBiGIezIPWS1fdVQq3YZFWnOGWjnMKc5j37L9UMj9D\nZVuCF6IPhkZfXpKBubarevp89VeAl3ZLDuAL78cwvkEwKjxvtBBn3SlJbVhgeJgD\nOZblmHaLIbQMZjarUbuO3ghA7o/ki7auhOM8/FS8MQKBgQDx0wfnVtIBNZ5Ul000\nnoUWq1DhYhb/wlgQwDU3iQicNdWI0qlCGpbZgn79uIzPwN6G0qV0iWDk6mnJlpSd\nzkJp5KLn2GhSK6kB7P918TLgTq9zdzhex5rarbJ5NKZBMRzzcr8qIuL4jA2Cdt7P\njVSH+4Gjwdx0uZfbwCH1yJg7HQKBgQDi+99OjOiHDEdvdoldWxfrV3InX3GKVA6D\nMbQdMRcMXGiqazxRb//SIFhS1rbxaweWYX1aKK2UNEdHNji3ow1onDaVEG6VygU+\nsLcxX8p5orUq0RbSEEIjASRU1MS1R2SO1GlzozxKY8OGhCrBM9cpaAe63f9xULCb\ngZFjUZIOeQKBgH4tARu41jxhUKqMg3EoIQMSAlKHDr8GFVMwJtRCQObYxADvAfeG\nzhzRlRcnevlPhgxMzp2+rHrkwKu5UPQB0e9Up5dW+B+fvkBN+4D7h/M3ux4BH718\nYpUlOlE5omGzkYqI3avLpifPU6E2Cs26zVdiaGMcXL3etJipaE7JCn0VAoGAWkj9\nZe0+gJktwPRRZ0TYms/JpEeejfspWp3mmsXv+Qa4yzCkaXA3PYmIGEs3sYd1GSfm\nCHqtsImq4HR80u6UYsvgGiLTGdmlhG4eMBF+JCvIDCPnA99brzjBDs0jAUhIg1eS\nKmD/lkdgep0PtJG+P8YVbQrolFYYKYK8JdlIU2ECgYEAq2e8UJN+KoT2GYZqOR99\nnpY8MHPy1288hdPJHh3uYQA01HogHOhqGh7LZ3d8dvvfZLqU+XTi2+YuA4dgvZbB\n1j1OF/oXHBNj5ruw+c9ja8qIt9Y+cWS23ZimeXwi8lTBnqlmhJMC6RhgNvZTV0sh\nLqBOEVxtetba9s9Tu7NG+08=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@nova-blog-ipybx.iam.gserviceaccount.com",
  "client_id": "106599033413373127929",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40nova-blog-ipybx.iam.gserviceaccount.com",
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
