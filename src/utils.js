// utils.js
import axios from 'axios';

export const mainURL = `${window.location.protocol}//${window.location.hostname}`;

export function loadImg(img, size = 'original') {
    if (!img || !size) return '/build/css/images/placeholder.webp';
    return `/build/css/images/placeholder.webp`;
    // return `http://image.tmdb.org/t/p/${size}${img}`;
}

export function truncate(string, length = 100, append = "...") {
    if (string.length > length) {
        string = string.substring(0, length) + append;
    }
    return string;
}

export async function fetchSessionStatus() {
    try {
        const response = await axios.get(`${mainURL}:3000/api/db/session`, { withCredentials: true });
        const user = response.data.user;
        if (user && user.isLoggedIn) {
            const userData = {
                isLoggedIn: user.isLoggedIn,
                id: user.id,
                username: user.name,
                role: user.role,
                img: '',
                uploads: [],
                volume: null
            };

            const userDbData = await getCurrentUserInfos(user);
            userData.img = userDbData.img;
            userData.uploads = userDbData.uploads;
            userData.volume = userDbData.volume;

            return userData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching session status:', error);
        return null;
    }
}

async function getCurrentUserInfos(user) {
    try {
        const response = await axios.get(`${mainURL}:3000/api/db/getUser?userID=${user.id}`);
        const userData = response.data[0];
        const userInfos = {
            img: '',
            volume: userData.media_volume ?? 1
        };

        userInfos.img = userData.img !== '-1' ? `${userData.img}` : `/media/avatar.webp`;
        return userInfos;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return {};
    }
}

export async function fetchPageSettings() {
    try {
        const response = await axios.get(`${mainURL}:3000/api/db/getSettings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching page settings:', error);
        return {};
    }
}
