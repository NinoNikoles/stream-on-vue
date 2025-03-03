<script>
import langSnippet from './mixins/language.vue';
import { get, fetchDB, postDB } from '../functions/database';
import { getSeasons, getEpisodes, getAllMediaInfos, getGenre, getGenreName, runtime, filterByGenre, filterBySetting } from '../functions/media';
import { sessionUser, getCurrentUserInfos, logout_function, checkWatchlist, watchListTrigger } from '../functions/user';
import { tmdbIDinArray, toggleMainMenu, closeMainMenu, bodyScrollDiv, scrollDiv, disableButton, enableButton, delay, callout, openPopUp, closePopUp, SelectTabs } from '../functions/utils';
import { get_page_settings, get_page_setting, get_page_title, get_page_design } from '../functions/page';
import { initSliders } from '../functions/slider';

export default {
    name: 'MainFunctions',
    mixins: [langSnippet],
    emits: ['data-fetched'],
    methods: {
        get,
        fetchDB,
        postDB,
        getSeasons,
        getEpisodes,
        getAllMediaInfos,
        getGenre,
        getGenreName,
        runtime,
        filterByGenre,
        filterBySetting,
        sessionUser,
        getCurrentUserInfos,
        logout_function,
        checkWatchlist,
        watchListTrigger,
        tmdbIDinArray,
        toggleMainMenu,
        closeMainMenu,
        bodyScrollDiv,
        scrollDiv,
        disableButton,
        enableButton,
        delay,
        callout,
        openPopUp,
        closePopUp,
        SelectTabs,
        get_page_settings,
        get_page_setting,
        get_page_title,
        get_page_design,
        initSliders
        // Weitere Methoden können hier hinzugefügt werden
    }
};
</script>