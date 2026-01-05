
import admin from "firebase-admin";

/**
 * Get Firebase service account credentials from environment variables.
 * Supports either base64-encoded JSON or individual environment variables.
 */
function getServiceAccountCredentials(): admin.ServiceAccount {
    // Option 1: Base64 encoded service account JSON
    const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64ServiceAccount) {
        try {
            const decoded = Buffer.from(base64ServiceAccount, "base64").toString("utf-8");
            return JSON.parse(decoded) as admin.ServiceAccount;
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", error);
        }
    }

    // Option 2: Individual environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
        return {
            projectId,
            clientEmail,
            privateKey,
        };
    }

    // Option 3: Fallback to local file for development (if exists)
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require("../../service-account.server.json");
        console.warn("Using local service-account.server.json - not recommended for production");
        return serviceAccount as admin.ServiceAccount;
    } catch {
        throw new Error(
            "Firebase Admin credentials not found. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or " +
            "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
        );
    }
}

let adminApp: admin.app.App | null = null;

function getAdminApp() {
    if (!adminApp) {
        if (admin.apps.length) {
            adminApp = admin.apps[0];
        } else {
            try {
                const credentials = getServiceAccountCredentials();
                adminApp = admin.initializeApp({
                    credential: admin.credential.cert(credentials),
                });
                console.log("Firebase Admin Initialized");
            } catch (error) {
                console.error("Firebase admin initialization error", error);
                throw error;
            }
        }
    }
    return adminApp;
}

export const getAdminAuth = () => getAdminApp()!.auth();
export const getAdminDb = () => getAdminApp()!.firestore();
