import { createApp, reactive } from 'vue';
import App from './App.vue';
import router from './router';
import { mainURL, loadImg, truncate, fetchSessionStatus, fetchPageSettings } from './utils';

const app = createApp(App);

app.config.globalProperties.productionTip = false; // Setze den Wert auf true oder false, wie benötigt

const user = await fetchSessionStatus();
const pageSettings = await fetchPageSettings();
const mediaInfos = null;

const globalState = reactive({
    user: user,
    pageSettings: pageSettings,
    mediaInfos: mediaInfos,
});

app.config.globalProperties.$mainURL = mainURL;
app.config.globalProperties.$loadImg = loadImg;
app.config.globalProperties.$truncate = truncate;
// app.config.globalProperties.$globalState.user = user;
app.config.globalProperties.$globalState = globalState;

app.mixin({
    created() {
        this.$nextTick(async () => {
            window.initCustomJS();

            const user = await fetchSessionStatus();
            const pageSettings = await fetchPageSettings();

            if (user) globalState.user = user;
            globalState.pageSettings = pageSettings;
            // globalState.mediaInfos = mediaInfos;
        });
    }
});

app.use(router);
app.mount('#app');