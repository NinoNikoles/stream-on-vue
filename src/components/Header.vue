<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <header id="header" class="bar-active-root bar-active fixed-header overlay" v-if="isLoggedIn">
        <div class="row header--content">
            <div class="col12 column header--content--nav">

                <!-- Logo -->
                <div class="header--logo">
                    <a class="logo--small" title="Zur Startseite" href="/">
                        <span class="bold"></span>
                    </a>
                </div>
            
                <!-- Hauptnavigation -->
                <div class="navWrap">

                    <!-- Suche -->
                    <div class="search-bar">
                        <div class="searchbar-wrap">
                            <div class="search-bar-fix"></div>
                            <input type="text" id="media-live-search" v-model="searchInput" @input="handleSearchInput" name="search" placeholder="Suchen">
                            <button class="btn search-btn"></button>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <nav id="navMain" class="header-menu-main" style="top: 50px; height: calc(widescreen - 50px);">
                        <ul class="menu">
                            <div class="col12 mobile-only">
                                <li class="menu-item spacer"><span>{{ langSnippet('menu') }}</span></li>
                            </div>

                            <li v-for="route in mainRoutes" :key="route.name" class="menu-item">
                                <a :href="`${route.path}`" :title="`${route.name}`">{{ route.name }}</a>
                            </li>

                            <div class="col12 mobile-only marg-top-m" v-if="this.role === 'superadmin' || this.role === 'admin'">
                                <li class="menu-item spacer"><span>{{ langSnippet('admin') }}</span></li>
                            </div>

                            <li v-for="route in backendRoutes" :key="route.name" class="menu-item mobile-only">
                                <a :href="`${route.path}`" :title="`${route.name}`">{{ route.name }}</a>
                            </li>
                            <!-- <div class="col12 mobile-only marg-top-m">
                                <li class="menu-item spacer"><span><?php echo lang_snippet('admin').' '.lang_snippet('menu');?></span></li>

                                <?php echo adminMenu('main-menu');?>
                            </div> -->
                        </ul>
                    </nav>

                    <!-- Profil -->
                    <button href="#" id="user-menu-btn">
                        <figure class="square">
                            <img data-img="" loading="lazy" alt="">
                        </figure>

                        <menu class="user-menu">
                            <ul>
                                <!-- <?php echo adminMenu('user-menu');?> -->
                                
                                <li class="menu-item"><a href="/user/?id=<?php echo getUserID(); ?>" :title="langSnippet('profile')">{{langSnippet('profile')}}</a></li>
                                <li class="menu-item"><a href="#" @click="logout()" :title="langSnippet('logout')">{{langSnippet('logout')}}</a></li>
                            </ul>
                        </menu>
                    </button>

                    <!-- Theme Switch button -->
                    <!--<a href="#" id="theme-switch" class="icon"></a>-->

                    <!-- Mobile Menu Button -->
                    <a href="#" class="nav-trigger menu-button" title="Menü öffnen">
                        <span class="tx">MENÜ</span>
                        <span class="trigger-bar bar-1"></span>
                        <span class="trigger-bar bar-2"></span>
                        <span class="trigger-bar bar-3"></span>
                    </a>
                </div>		
            </div>
        </div>

        <div v-if="searchResults !== null" id="searchResults" class="pad-top-xxl pad-bottom-xxl" style="height: calc(100vh - 50px); width: 100%; position:absolute; top:50px; left:0;">
            <div class="innerWrap">
                <div class="col12">
                    <h1>Suchergebnisse für: {{ searchInput }}</h1>

                    <div class="grid-row" id="media-list">
                        <div v-for="(media, index) in searchResults" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding">
                            <div class="media-card">
                                <div class="media-card-wrapper">
                                    <figure class="widescreen desktop-only">
                                        <img src="" data-img="http://localhost:8080/build/css/images/img_preview.webp" :alt="`${media.title}`">
                                    </figure>
                                    <figure class="poster mobile-only">
                                        <img src="" data-img="http://localhost:8080/build/css/images/img_preview.webp" :alt="`${media.title}`">
                                    </figure>
                                    <div class="link-wrapper">
                                        <a v-if="media.file_path" href="#" :title="`${media.title}`" class="play-trigger"></a>
                                        <a href="#" @click="selectMedia(media)" :title="langSnippet('more_informations')" class="info-trigger trigger-header" data-modal :data-src="`${media.tmdbID}`"></a>
                                        <a :href="`/backend/${media.media_type}/${media.tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </header>

    <div class="modal" id="modalHeader">
        <div class="modal-overlay"></div>
        <div class="modal-wrap large">
            <div class="modal-inner-wrap">
                <div v-if="selectedMedia" class="info-popup" :id="`${selectedMedia.tmdbID}`">
                    <div class="col12 marg-bottom-xs mobile-only">
                        <figure class="widescreen">
                            <img data-img="http://localhost:8080/build/css/images/img_preview.webp" loading="lazy" importance="low" alt="">
                        </figure>
                    </div>
                    <div class="innerWrap">
                        <div class="col7 marg-right-col1">
                            <p class="h2">{{ selectedMedia.title }}</p>
                            <p class="small tag-list marg-bottom-base">
                                <span class="tag">{{ selectedMedia.release_date }}</span>
                                <span class="tag">{{ selectedMedia.rating }}/10 ★</span>
                                <!-- <span class="tag">'.$extraInfo.'</span> -->
                            </p>
                            <a v-if="selectedMedia.file_path" href="#" class="btn btn-small btn-white icon-left icon-play marg-right-xs">{{ langSnippet('watch_now') }}</a>
                            <p class="small">{{ selectedMedia.overview }}</p>
                            <p v-if="selectedMediaGenre" class="small tag-list marg-bottom-base">
                                <span v-for="(genre, index) in selectedMediaGenre" :key="index" class="tag">
                                    {{ genre }}
                                </span>
                            </p>
                        </div>
                        <div class="col4 desktop-only">
                            <figure class="poster">
                                <img data-img="http://localhost:8080/build/css/images/img_preview.webp" alt="" loading="lazy" importance="low">
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
            <a href="#" class="modal-close"></a>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios';
import router from './../router';
import langSnippet from './api/language.vue';
import tmdb from './api/tmdbAPI.vue';

export default {
    name: 'AppHeader',
    mixins: [langSnippet, tmdb],
    data() {
        return {
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
            let input = this.searchInput;

            if ( input !== '' ) {
                try {
                    var response = await axios.get(`${this.$mainURL}:3000/api/db/mediaByInput?input=${input}&orderBy=title&order=ASC`);
                    this.searchResults = response.data;
                } catch (err) {
                    console.log(err);
                }
            } else {
                this.searchResults = null;
            }            
        },
        async selectMedia(media) {
            this.selectedMedia = media;
            var mediaGenres = JSON.parse(this.selectedMedia.genres);

            const selectedMediaGenre = [];

            for ( var genre of mediaGenres ) {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/genreNameByID?id=${genre}`);
                    var genreName  = response.data[0].genre_name;
                    selectedMediaGenre.push(genreName);
                } catch (error) {
                    // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                    console.log(error);
                }
            }

            this.selectedMediaGenre = selectedMediaGenre;            
        },
        async logout() {
            // Benutzeranmeldeinformationen            
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/logout`, { username: '', role: ''}, { withCredentials: true })
                .then(async(response) => {
                    console.log(response.data.message);
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
                    this.username = response.data.user.name;
                    this.role = response.data.user.role;
                }               
            } catch (error) {
                console.error('Fehler beim Abrufen des Session-Status:', error);
            }
        },
        async isAdminOrSuperadmin() {
            return this.role;
        }
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
            }
        });
    }
};
</script>