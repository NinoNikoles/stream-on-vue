import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { mainURL, loadImg, truncate, fetchSessionStatus, fetchPageSettings } from './utils';

const app = createApp(App);

app.config.globalProperties.productionTip = false; // Setze den Wert auf true oder false, wie benötigt

const user = await fetchSessionStatus();
const pageSettings = await fetchPageSettings();

app.config.globalProperties.$mainURL = mainURL;
app.config.globalProperties.$loadImg = loadImg;
app.config.globalProperties.$truncate = truncate;
app.config.globalProperties.$user = user;
app.config.globalProperties.$pageSettings = pageSettings;

app.mixin({
    updated() {
        this.$nextTick(async () => {
            window.initCustomJS();

            const user = await fetchSessionStatus();
            const pageSettings = await fetchPageSettings();

            if (user) app.config.globalProperties.$user = user;
            app.config.globalProperties.$pageSettings = pageSettings;
        });
    }
});

app.use(router);
app.mount('#app');