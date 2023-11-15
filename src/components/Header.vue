<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <header id="header" class="bar-active-root bar-active fixed-header overlay">
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

                            <div class="col12 mobile-only marg-top-m">
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
                    <!-- <button href="#" id="user-menu-btn">
                        <figure class="square">
                            <img data-img="<?php echo userProfileImg(); ?>" loading="lazy" alt="">
                        </figure>

                        <menu class="user-menu">
                            <ul>
                                <?php echo adminMenu('user-menu');?>
                                
                                <li class="menu-item"><a href="/user/?id=<?php echo getUserID(); ?>" title="<?php echo lang_snippet('profile'); ?>"><?php echo lang_snippet('profile'); ?></a></li>
                                <li class="menu-item"><a href="/logout" title="<?php echo lang_snippet('logout'); ?>"><?php echo lang_snippet('logout'); ?></a></li>
                            </ul>
                        </menu>
                    </button> -->

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

        <div v-if="searchResults" id="searchResults" style="width:100vw;height:calc(100vh - 50px);position:absolute;top:50px;left:0;z-index:-10;background-color:blue"></div>
    </header>
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
            mainRoutes: null,
            backendRoutes: null,
            router: router, // Greife auf die Routen des router-Objekts zu
            routes: router.options.routes,
            searchInput: '',
            searchResults: null
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
                return route.meta.backend;
            });
        },
        async handleSearchInput() {
            let input = this.searchInput;
            console.log(input);

            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/mediaByInput?input=${input}&orderBy=title&order=ASC`);
                console.log(response.data);
                this.searchResults = response.data;
            } catch (err) {
                console.log(err);
            }
            
        },
    },
    mounted() {
        this.mainRouter().then(routes => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.mainRoutes = routes;
        });
        this.backendRouter().then(routes => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.backendRoutes = routes;
        });
    }
};
</script>