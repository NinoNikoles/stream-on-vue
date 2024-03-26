import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

const app = createApp(App);

// Setze globale Konfigurationsoptionen (wie productionTip)
app.config.globalProperties.productionTip = false; // Setze den Wert auf true oder false, wie benötigt
const mainURL = window.location.protocol + '//' + window.location.hostname;

function loadImg(img, size = 'original') {
    if ( !img || !size) return '/build/css/images/placeholder.webp';
    return '/build/css/images/placeholder.webp';
    // return `http://image.tmdb.org/t/p/${size}${img}`;
}

function truncate(string, length = 100, append = "...") {
    if (string.length > length) {
        string = string.substring(0, length) + append;
    }
    return string;
}


async function fetchSessionStatus(mainURL) {
    async function getSession(mainURL) {
        return new Promise((resolve, reject) => {
            try {
                const response = axios.get(`${mainURL}:3000/api/db/session`, { withCredentials: true });
                resolve(response);
            } catch(err) {
                reject(err);
            }            
        });
    }

    async function getCurrentUserInfos(mainURL, user) {
        try {
            var response = await axios.get(`${mainURL}:3000/api/db/getUser?userID=${user.id}`);
            var userData = response.data[0];
            var userInfos = {
                activeImg: '',
                uploads: JSON.parse(userData.uploads),
                volume: userData.media_volume
            };

            userInfos.activeImg = `/media/avatar.webp`;
            if ( userData.img !== '-1' ) userInfos.activeImg = `/media/user_uploads/${user.id}/${userData.img}`;

            return userInfos;
        } catch (error) {
            return error;
        }
    }

    try {
        const response = await getSession(mainURL);
        if ( response.data.user ) {
            var userData = {
                isLoggedIn: response.data.user.isLoggedIn,
                id: response.data.user.id,
                username: response.data.user.name,
                role: response.data.user.role,
                activeImg: '',
                uploads: [],
                volume: null
            }

            try {
                var userDbData = await getCurrentUserInfos(mainURL, userData);
                userData.activeImg = userDbData.activeImg;
                userData.uploads = userDbData.uploads;
                userData.volume = userDbData.volume;

                return new Promise((resolve) => {
                    resolve(userData);
                });
            } catch(err) {
                return err;
            }
        }               
    } catch (error) {
        return error;
    }         
}

async function fetchPageSettings(mainURL) {
    try {
        var response = await axios.get(`${mainURL}:3000/api/db/getSettings`);
        return new Promise((resolve) => {
            resolve(response.data);
        });
    } catch (error) {
        return error;
    }   
}


var user = await fetchSessionStatus(mainURL);
var pageSettings = await fetchPageSettings(mainURL);

app.config.globalProperties.$mainURL = mainURL;
app.config.globalProperties.$loadImg = loadImg;
app.config.globalProperties.$truncate = truncate;
app.config.globalProperties.$user = user;
app.config.globalProperties.$pageSettings = pageSettings;

app.mixin({
    updated() {        
        this.$nextTick(async () => {
            window.initCustomJS();
            
            var user = await fetchSessionStatus(mainURL);
            var pageSettings = await fetchPageSettings(mainURL);
            
            app.config.globalProperties.$user = user;
            app.config.globalProperties.$pageSettings = pageSettings;
        });
    }
});

app.use(router);
app.mount('#app');