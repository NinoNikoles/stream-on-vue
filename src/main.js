import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// Setze globale Konfigurationsoptionen (wie productionTip)
app.config.globalProperties.productionTip = false; // Setze den Wert auf true oder false, wie benötigt

function loadImg(size, img) {
    if ( !size || !img ) console.log(`http://image.tmdb.org/t/p/${size}${img}`);
    return '/build/css/images/img_preview.webp';
}

function truncate(string, length = 100, append = "...") {
    if (string.length > length) {
        string = string.substring(0, length) + append;
    }
    return string;
}

const mainURL = window.location.protocol + '//' + window.location.hostname;
app.config.globalProperties.$mainURL = mainURL;
app.config.globalProperties.$loadImg = loadImg;
app.config.globalProperties.$truncate = truncate;

app.mixin({
    updated() {
        this.$nextTick(() => {
            window.initCustomJS();
        });
    }
});

app.use(router).mount('#app');