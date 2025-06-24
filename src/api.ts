import axios from 'axios';
import { BASE_URL } from './config.ts';
import fs from 'fs';
import FormData from 'form-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import storage from 'node-persist';

const API_URL = BASE_URL;
// await storage.init();
export async function login(email: string, password: string) {
    try {
        const url = `${API_URL}/auth/login/`;
        const response = await axios.post(url, {
            email,
            password,
            stayLogin: true,
        });

        await AsyncStorage.setItem('ConnectxLocalStorage', JSON.stringify(response.data));  /// Native
        // await storage.setItem('ConnectxLocalStorage', response.data); /// Local
        return response.data;
    } catch (error) {
        console.error('Error in login:', error);
        throw error;
    }
}


export async function getRecords(object: string, payload: any) {
    try {
        const headers = await _header();

        const url = `${API_URL}/object/${object}/getRecords`;

        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        console.error('Error in getRecords:', error);
        throw error;
    }
}

export async function countRecords(object: string, payload: any) {

    const headers = await _header();

    const url = `${API_URL}/object/${object}/countRecords`;

    const response = await axios.post(url, payload, { headers });
    return response.data;

}

export async function createRecords(object: string, payload: any) {

    const headers = await _header();

    const url = `${API_URL}/object/${object}`;

    const response = await axios.post(url, payload, { headers });
    return response.data;

}

export async function updateRecords(object: string, externalId: string, payload: any) {
    const headers = await _header();
    const url = `${API_URL}/object/${object}?externalId=${externalId}`;
    const response = await axios.patch(url, payload, { headers });
    return response.data;
}

export async function uploadImage(object: string, urlImage: string) {
    try {
        const formData = new FormData();
        const headers = await _header();

        formData.append('file', fs.createReadStream(urlImage));

        const profileStorage = await AsyncStorage.getItem('ConnectxLocalStorage');
        // const profileStorage = await storage.getItem('ConnectxLocalStorage');
        if (!profileStorage) {
            throw new Error('No profile found in storage');
        }
        // const profile = JSON.parse(profileStorage);
        const profile = typeof profileStorage === 'string' ? JSON.parse(profileStorage) : profileStorage;
        formData.append('path', `Organizes/${profile.organizeId}/objects/${object}`);
        headers['Content-Type'] = 'multipart/form-data';
        const url = `${API_URL}/storage/uploadFile`;
        const response = await axios.post(url, formData, { headers },);
        return response.data;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        throw error;
    }
}


export async function logout() {
    const headers = await _header();
    const url = `${API_URL}/auth/logout`;
    const response = await axios.get(url, { headers });
    await AsyncStorage.removeItem('ConnectxLocalStorage');
    // await storage.removeItem('ConnectxLocalStorage');
    return response.data;

}


async function _header() {
    const profileStorage = await AsyncStorage.getItem('ConnectxLocalStorage');
    // const profileStorage = await storage.getItem('ConnectxLocalStorage');
    if (!profileStorage) {
        throw new Error('No profile found in storage');
    }

    const profile = JSON.parse(profileStorage);
    // const profile = profileStorage;
    const token = profile.access_token;

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
    };
}