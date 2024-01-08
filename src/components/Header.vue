<template>
    <header id="header" class="bar-active-root bar-active fixed-header overlay" v-if="isLoggedIn">
        <div class="row header--content">
            <div class="col12 column header--content--nav">

                <!-- Logo -->
                <div class="header--logo">
                    <router-link class="logo--small" title="Zur Startseite" to="/">
                        <span class="bold">Stream On</span>
                    </router-link>
                </div>
            
                <!-- Hauptnavigation -->
                <div class="navWrap">

                    <!-- Suche -->
                    <div id="search-bar" class="search-bar">
                        <div class="searchbar-wrap">
                            <div class="search-bar-fix"></div>
                            <input type="text" id="media-live-search" v-model="searchInput" @input="handleSearchInput" name="search" placeholder="Suchen">
                            <button id="search-btn" @click="searchTrigger($event)" class="btn search-btn"></button>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <nav id="navMain" class="header-menu-main" style="top: 50px; height: calc(widescreen - 50px);">
                        <ul class="menu">
                            <div class="col12 mobile-only">
                                <li class="menu-item spacer"><span>{{ langSnippet('menu') }}</span></li>
                            </div>

                            <li v-for="route in mainRoutes" :key="route.name" class="menu-item">
                                <router-link :to="`${route.path}`" :title="`${route.name}`" @click="toggleMainMenu($event)">{{ route.name }}</router-link>
                            </li>

                            <div class="col12 mobile-only marg-top-m" v-if="this.role === 'superadmin' || this.role === 'admin'">
                                <li class="menu-item spacer"><span>{{ langSnippet('admin') }}</span></li>
                            </div>

                            <li v-for="route in backendRoutes" :key="route.name" class="menu-item mobile-only">
                                <router-link :to="`${route.path}`" :title="`${route.name}`" @click="toggleMainMenu($event)">{{ route.name }}</router-link>
                            </li>
                            <!-- <div class="col12 mobile-only marg-top-m">
                                <li class="menu-item spacer"><span><?php echo lang_snippet('admin').' '.lang_snippet('menu');?></span></li>

                                <?php echo adminMenu('main-menu');?>
                            </div> -->
                        </ul>
                    </nav>

                    <!-- Profil -->
                    <button href="#" @click="userBtnTrigger()" id="user-menu-btn">
                        <figure class="square">
                            <img :data-img="`${this.currentUser.activeImg}`" loading="lazy" alt="" id="userIcon">
                        </figure>

                        <menu class="user-menu">
                            <ul>
                                <li v-for="route in backendRoutes" :key="route.name" class="desktop-only">
                                    <router-link :to="`${route.path}`" :title="`${route.name}`">{{ route.name }}</router-link>
                                </li>
                                
                                <li class="menu-item"><router-link :to="`/user/${id}`" :title="langSnippet('profile')">{{langSnippet('profile')}}</router-link></li>
                                <li class="menu-item"><a href="#" @click="logout()" class="bg-alert" :title="langSnippet('logout')">{{langSnippet('logout')}}</a></li>
                            </ul>
                        </menu>
                    </button>

                    <!-- Theme Switch button -->
                    <!--<a href="#" id="theme-switch" class="icon"></a>-->

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

        <div v-if="searchResults !== null" id="searchResults" class="pad-top-l pad-bottom-l bg-dark">
            <div class="innerWrap">
                <div class="col12">
                    <h1>Suchergebnisse für: {{ searchInput }}</h1>
                </div>
            </div>

            <div class="innerWrap">
                <div class="grid-row" id="media-list">
                    <div v-for="(media, index) in searchResults" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding">
                        <div class="media-card">
                            <div class="media-card-wrapper">
                                <figure class="widescreen desktop-only">
                                    <img src="" :data-img="$loadImg(media['mediaDetails'].backdrop)" :alt="`${media.title}`">
                                </figure>
                                <figure class="poster mobile-only">
                                    <img src="" :data-img="$loadImg(media['mediaDetails'].poster)" :alt="`${media['mediaDetails'].title}`">
                                </figure>
                                <div class="link-wrapper">
                                    <a v-if="media['mediaDetails'].file_path" href="#" :title="`${media['mediaDetails'].title}`" class="play-trigger"></a>
                                    <a href="#" @click="openMediaPopUp(media, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-header" data-modal :data-src="`${media['mediaDetails'].tmdbID}`"></a>
                                    <a :href="`/backend/${media['mediaDetails'].media_type}/${media['mediaDetails'].tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
  
<script>
import axios from 'axios';
import router from './../router';
import functions from './mixins/functions.vue';
import langSnippet from './mixins/language.vue';
import tmdb from './mixins/tmdbAPI.vue';

export default {
    name: 'AppHeader',
    mixins: [functions, langSnippet, tmdb],
    data() {
        return {
            id: null,
            username: '',
            role: 'user',
            isLoggedIn: null,
            mainRoutes: null,
            backendRoutes: null,
            router: router, // Greife auf die Routen des router-Objekts zu
            routes: router.options.routes,
            searchInput: '',
            searchResults: null,
            selectedMedia: null,
            selectedMediaGenre: null,
            selectMediaWatchlist: null,
            currentUser: {
                id: null,
                username: null,
                activeImg: null,
                images: [],
            },
            mediaPath: 'media',
            userUploadPath: 'user_uploads',
        };
    },
    methods: {
        async mainRouter() {
            return this.routes.filter(route => {
                return route.meta.main;
            });
        },
        async backendRouter() {
            return this.routes.filter(route => {
                if ( this.role === 'superadmin' || this.role === 'admin') return route.meta.backend;                
            });
        },
        async handleSearchInput() {
            setTimeout(async() => {
                let input = this.searchInput;
                var media = [];
                var mediaInfos = [];
                var mediaGenre = [];

                if ( input !== '' ) {
                    if ( !document.body.classList.contains('active-search') ) document.body.classList.add('active-search');

                    try {
                        media = [];

                        var response = await axios.get(`${this.$mainURL}:3000/api/db/mediaByInput?input=${input}&orderBy=title&order=ASC`);
                        var searchResults = response.data;

                        for (let i = 0; i < searchResults.length; i++) {
                            mediaInfos = [];
                            mediaGenre = [];

                            try {
                                if ( searchResults[i].media_type === 'show' ) {
                                    mediaInfos['seasons'] = await this.getSeasons(searchResults[i].tmdbID);
                                    mediaInfos['episodes'] = await this.getEpisodes(searchResults[i].tmdbID);
                                }

                                var mediaGenreIDs = JSON.parse(searchResults[i].genres);
                                for (let x = 0; x < mediaGenreIDs.length; x++) {
                                    try {
                                        mediaGenre.push(await this.getGenre(mediaGenreIDs[x]));
                                        
                                    } catch(e) {
                                        console.log(e);
                                    }                                    
                                }

                                mediaInfos['genre'] = mediaGenre;
                                mediaInfos['mediaDetails'] = searchResults[i];
                                mediaInfos['mediaDetails']['watchlist_status'] = await this.checkWatchlist(searchResults[i].tmdbID);
                                media[i] = mediaInfos;
                                
                            } catch (error) {
                                console.log(error);
                            }
                        }

                        this.searchResults = media;
                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    document.body.classList.remove('active-search');
                    this.searchResults = null;
                }
            }, 500);
        },
        async getSeasons(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getSeasons?showID=${showID}`);
                return response.data;                
            } catch (error) {
                console.log(error);
            }
        },
        async getEpisodes(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getEpisodes?showID=${showID}`);
                return response.data;                
            } catch (error) {
                console.log(error);
            }
        },
        async getGenre(genreID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreNameByID?id=${genreID}`);
                return response.data[0].genre_name;                
            } catch (error) {
                console.log(error);
            }
        },
        async logout() {
            // Benutzeranmeldeinformationen            
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/logout`, { username: '', role: ''}, { withCredentials: true })
                .then(async() => {
                    window.location.href = '/';               
                })
                .catch((error) => {
                    // Fehler bei der Anmeldung
                    console.error('Login failed', error);
                });
            } catch(err) {
                console.log(err);
            }
        },
        async fetchSessionStatus() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                if ( response.data.user ) {
                    this.isLoggedIn = response.data.user.isLoggedIn;
                    this.id = response.data.user.id;
                    this.username = response.data.user.name;
                    this.role = response.data.user.role;
                }               
            } catch (error) {
                console.error('Fehler beim Abrufen des Session-Status:', error);
            }
        },
        async getCurrentUserInfo() {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getUser?userID=${this.id}`);
                this.currentUser.username = response.data[0].username;
                if ( response.data[0].user_img !== 'avatar' ) {
                    this.currentUser.activeImg = `/${this.mediaPath}/${this.userUploadPath}/${this.currentUser.username}/${response.data[0].user_img}`;
                } else {
                    this.currentUser.activeImg = `/${this.mediaPath}/${response.data[0].user_img}.webp`;
                }            
                this.currentUser.uploads = JSON.parse(response.data[0].uploads);
                this.selectedImg = this.currentUser.activeImg;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return [];
            }
        },
        async isAdminOrSuperadmin() {
            return this.role;
        },
        searchTrigger(event) {
            event.preventDefault();
            var searchBar = document.getElementById('search-bar');
            var liveSearch = document.getElementById('media-live-search');
            var activeClass = 'active-search';            

            if ( !(searchBar.classList.contains(activeClass)) ) {
                document.body.classList.add(activeClass);
                liveSearch.value = '';
                searchBar.classList.add(activeClass);
            } else {
                liveSearch.value = '';
                searchBar.classList.remove(activeClass);
                document.body.classList.remove(activeClass);
                this.searchResults = null;
            }
        },        

    },
    mounted() {
        this.fetchSessionStatus()
        .then(() => {
            if ( this.isLoggedIn === true ) {
                this.mainRouter().then(routes => {
                    // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
                    this.mainRoutes = routes;
                });
                this.backendRouter().then(routes => {
                    // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
                    this.backendRoutes = routes;
                });
                this.getCurrentUserInfo();            
            }
        });

    }
};
</script>