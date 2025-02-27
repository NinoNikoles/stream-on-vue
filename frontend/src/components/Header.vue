<template>
    <header id="header" class="bar-active-root bar-active fixed-header overlay" v-if="$globalState.user && $route.meta.noHeader !== true">
        <div class="row header--content">
            <div class="col12 column header--content--nav">

                <!-- Logo -->
                <div class="header--logo">
                    <router-link class="logo--small" title="Zur Startseite" to="/">
                        <span class="bold">{{ get_page_title() }}</span>
                    </router-link>
                </div>
            
                <!-- Hauptnavigation -->
                <div class="navWrap">

                    <!-- Suche -->
                    <div id="search-bar" class="search-bar">
                        <div class="searchbar-wrap">
                            <div class="search-bar-fix"></div>
                            <input type="text" id="media-live-search" name="search" v-model="searchInput" placeholder="Suchen">
                            <span class="loader"></span>
                            <button id="search-btn" @click="searchTrigger($event)" class="btn search-btn"></button>
                        </div>
                    </div>

                    <!-- Profil -->
                    <button id="user-menu-btn">
                        <figure class="square">
                            <img :src="$globalState.user.img" loading="lazy" alt="" id="userIcon">
                        </figure>

                        <menu class="user-menu">
                            <ul>
                                <li><router-link :to="`/b/settings`" :title="langSnippet('settings')" @click="closeMainMenu()">{{ langSnippet('settings') }}</router-link></li>
                                
                                <li class="menu-item"><router-link :to="`/u/${$globalState.user.username}`" @click="closeMainMenu()" :title="langSnippet('profile')">{{langSnippet('profile')}}</router-link></li>
                                <li class="menu-item"><router-link :to="`/logout`" class="bg-alert" :title="langSnippet('logout')">{{langSnippet('logout')}}</router-link></li>
                            </ul>
                        </menu>
                    </button>

                    <!-- Navigation -->
                    <nav id="navMain" class="header-menu-main" style="top: 50px; height: calc(widescreen - 50px);">
                        <ul class="menu">
                            <div class="col12 mobile-only">
                                <li class="menu-item spacer"><span>{{ langSnippet('menu') }}</span></li>
                            </div>

                            <li v-for="route in mainRoutes" :key="route.name" class="menu-item">
                                <router-link :to="`${route.path}`" :title="`${route.name}`" @click="closeMainMenu()">{{ route.name }}</router-link>
                            </li>

                            <div class="col12 mobile-only marg-top-m" v-if="$globalState.user.role === 'superadmin' || $globalState.user.role === 'admin'">
                                <li class="menu-item spacer"><span>{{ langSnippet('admin') }}</span></li>
                            </div>

                            <li v-for="route in backendRoutes" :key="route.name" class="menu-item mobile-only">
                                <router-link :to="`${route.path}`" :title="`${route.name}`" @click="closeMainMenu()">{{ route.name }}</router-link>
                            </li>
                        </ul>
                    </nav>

                    <!-- Theme Switch button -->
                    <!-- <a href="#" id="theme-switch" class="icon" @click="themeChange($event)"></a> -->

                    <!-- Mobile Menu Button -->
                    <a href="#" @click="toggleMainMenu($event)" id="menu-button" class="nav-trigger menu-button" title="Menü öffnen">
                        <span class="tx">MENÜ</span>
                        <span class="trigger-bar bar-1"></span>
                        <span class="trigger-bar bar-2"></span>
                        <span class="trigger-bar bar-3"></span>
                    </a>
                </div>		
            </div>
        </div>

        <div v-if="searchResults !== null" id="searchResults" class="pad-bottom-l bg-dark" :style="`height: ${resultsHeight}px; width: ${space}`">
            
            <div class="innerWrap pad-top-s sticky-top">
                <div class="col12">
                    <h2>Suchergebnisse für: {{ searchInput }}</h2>
                </div>
            </div>

            <div class="innerWrap">
                <div class="grid-row" id="media-list">
                    <div v-for="(media, index) in searchResults" :key="index" class="col-6 col-4-xsmall col-3-small col-2-medium grid-padding media">
                        <media-card :media="media" :id="media.tmdbID+'-search'"></media-card>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
</template>
  
<script>
import router from '../router';
import functions from './functions.vue';
import langSnippet from './mixins/language.vue';
import tmdb from './mixins/tmdbAPI.vue';
import MediaCard from './includes/MediaCard.vue';

let mediaInfos = [];

export default {
    name: 'AppHeader',
    mixins: [functions, langSnippet, tmdb],
    components: {
        'media-card': MediaCard,
    },
    data() {
        return {
            resultsHeight: null,
            mainRoutes: null,
            backendRoutes: null,
            router: router, // Greife auf die Routen des router-Objekts zu
            routes: router.options.routes,
            searchInput: '',
            searchResults: null,
            searchResultsOutput: null,
            selectedMedia: null,
            selectedMediaGenre: null,
            selectMediaWatchlist: null,
            space: null
        };
    },
    methods: {
        mediaOpen(media, index) {
            this.searchResults[index].watchlist_status = media.watchlist_status;
            this.onMediaPopUp(media);
        },
        async mainRouter() {
            return this.routes.filter(route => {
                return route.meta.main;
            });
        },
        async backendRouter() {
            return this.routes.filter(route => {
                if ( this.$globalState.user.role === 'superadmin' || this.$globalState.user.role === 'admin') return route.meta.backend;                
            });
        },
        async handleSearchInput() {
            const searchInputField = document.getElementById('media-live-search');
            let delayTimer;

            searchInputField.addEventListener('input', () => {
                document.getElementById('search-bar').classList.add('searching');
                if (delayTimer) {
                    clearTimeout(delayTimer);
                }

                delayTimer = setTimeout(async () => {
                    const input = searchInputField.value;

                    if (input !== '') {
                        document.body.classList.add('active-search');

                        var mediaResponse = await this.get(`SELECT tmdbID FROM media WHERE title $$$$ ORDER BY title ASC`, input);

                        for (let i = 0; i < mediaResponse.length; i++) {
                            if ( !mediaInfos.includes(mediaResponse[i].tmdbID) ) {
                                mediaInfos.push(mediaResponse[i].tmdbID);
                            }
                        }

                        var ids = mediaInfos.filter(num => mediaResponse.some(obj => obj.tmdbID === num));
                        this.searchResults = await this.getAllMediaInfos('title', 'ASC', ids);
                    } else {
                        document.body.classList.remove('active-search');                        
                        this.searchResults = null;
                    }

                    document.getElementById('search-bar').classList.remove('searching');
                }, 1000);
            });
        },
        async logout() {
            await this.logout_function();
        },
        searchTrigger(event) {
            event.preventDefault();
            var searchBar = document.getElementById('search-bar');
            var liveSearch = document.getElementById('media-live-search');
            var activeClass = 'active-search';

            if ( !(searchBar.classList.contains(activeClass)) ) {
                liveSearch.value = '';
                searchBar.classList.add(activeClass);
            } else {
                liveSearch.value = '';
                searchBar.classList.remove(activeClass);
                document.body.classList.remove(activeClass);
                this.searchResults = null;
            }
        },
        async popUpTrigger(index, media, event) {
            var status =  await this.checkWatchlist(media.tmdbID);
            this.searchResults[index].watchlist_status = status
            media.watchlist_status = status;
            this.openMediaPopUp(media, event);
        },
    },
    updated() {
        var resultWrap = document.getElementById('searchResults');

        if (this.searchResults) {
            this.resultsHeight = window.innerHeight-100;
            if ( document.getElementById('media-list').clientHeight > this.resultsHeight ) {
                if (resultWrap) resultWrap.style.overflowY = 'scroll';
            } else {
                if (resultWrap) resultWrap.style.overflowY = 'hidden';
            }
        }
    },
    async mounted() {
        if ( this.$globalState.user && this.$globalState.user.isLoggedIn === true ) {
            await this.mainRouter().then(routes => {
                // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
                this.mainRoutes = routes;
            });
            this.backendRoutes = await this.backendRouter();
            await this.getCurrentUserInfos();
            await this.handleSearchInput();
        }
    }
};
</script>