import { login, getRecords, countRecords, createRecords, updateRecords, logout, uploadImage } from "./api.ts";
import CryptoJS from "crypto-js";
import { TOKEN } from "./config.ts";

const API_TOKEN = TOKEN;
export function loginConnectX({ email, password, }: { email: string; password: string; }) {

    const message = password + email.toLowerCase().trim() + API_TOKEN;

    const encryptPassword = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, message).finalize();
    return login(email, encryptPassword.toString());
}

export function getRecordsConnectX({ object, payload }: { object: string; payload: any; }) {
    return getRecords(object, payload);
}
export function countRecordsConnectX({ object, payload }: { object: string; payload: any; }) {
    return countRecords(object, payload);
}
export async function createRecordsConnectX({ object, payload }: { object: string; payload: any; }) {
    const newPayload = await _checkPayload(object, payload);
    return createRecords(object, newPayload);
}
export function updateRecordsConnectX({
    object,
    externalId,
    payload,
}: {
    object: string;
    externalId: string;
    payload: any;
}) {
    return updateRecords(object, externalId, payload);
}

export function logoutConnectX() {
    return logout();
}

export function uploadFileConnectX({ object, urlImage }: { object: string; urlImage: string }) {
    return uploadImage(object, urlImage);
}

async function _checkPayload(object: string, payload: any) {
    for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'string') {
            const pathImage = _getPathImage(value);
            if (pathImage === 'android' || pathImage === 'ios') {
                try {
                    const res = await uploadImage(object, value);
                    payload[key] = res.url;
                } catch (e) {
                    console.error(`Upload failed for key: ${key}`, e);
                }
            }
        }
    }

    return payload;
}


function _getPathImage(path: string) {
    if (!path) return 'unknown';

    // android (real device & simulator)
    if (
        path.startsWith('/storage/emulated/') ||
        path.startsWith('file:///storage/emulated/') ||
        path.startsWith('content://') ||
        path.startsWith('/data/user/') ||
        path.startsWith('file:///data/user/')
    ) {
        return 'android';
    }

    // iOS (real device & simulator)
    if (
        path.startsWith('/var/mobile/') || // real device
        path.startsWith('/private/var/mobile/') ||
        path.startsWith('/private/var/containers/') || // app sandbox
        path.startsWith('/Users/') || // simulator
        path.startsWith('file:///Users/')
    ) {
        return 'ios';
    }

    // macOS
    if (
        path.startsWith('/Users/') ||
        path.startsWith('/Volumes/') ||
        path.startsWith('/private/var/folders/')
    ) {
        return 'macos';
    }

    // Windows (ใช้ \\ หรือ :\\)
    if (
        path.includes(':\\') || // C:\path\to\file
        path.includes(':/') ||  // C:/path/to/file (บางระบบแปลง \ เป็น /)
        path.startsWith('\\\\') // UNC path
    ) {
        return 'windows';
    }

    // URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return 'url';
    }

    return 'unknown';
}