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
export async function updateRecordsConnectX({
    object,
    externalId,
    payload,
}: {
    object: string;
    externalId: string;
    payload: any;
}) {
    const newPayload = await _checkPayload(object, payload);
    return updateRecords(object, externalId, newPayload);
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
            if (pathImage === 'image') {
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
    if (
        path.startsWith('data:image')
    ) {
        return 'image';
    }

    return 'unknown';
}