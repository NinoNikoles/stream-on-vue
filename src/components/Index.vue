<template>
    <div id="loader" class="">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="col12 pad-bottom-xl">
        <div v-if="highlight" class="highlight-wrapper">
            <figure class="widescreen"><img :data-img="$loadImg(highlight.backdrop)" loading="lazy" :alt="`${highlight.title}`"></figure>
            <figure class="poster"><img :data-img="$loadImg(highlight.poster)" loading="lazy" :alt="`${highlight.title}`"></figure>
            <div class='content-wrap mobile-only'>
                <h1 class="h1 text-center">{{  highlight.title }}</h1>
                <p class="small">{{  highlight.overview }}</p>
            </div>
            <div class='content-wrap desktop-only'>
                <h1 class="h2 text-center">{{  highlight.title }}</h1>
                <p>{{  highlight.overview }}</p>
            </div>
        </div>

        <div v-if="availableSlider">
            <div v-for="(slider, index) in availableSlider" :key="index" :class="`genre-slider genre-slider-${index} marg-top-l`">
                <div class="col12">
                    <div class="column column-space-2">
                        <h3>{{ slider.genre.genre_name }}</h3>
                    </div>

                    <div class="col12">
                        <div class="swiper card-slider column column-space-2">
                            <div class="swiper-wrapper">
                                <div v-for="(media, index) in slider.mediaElements" :key="index" class="swiper-slide">
                                    <div class="media-card">
                                        <div class="media-card-wrapper">
                                            <template v-if="media['mediaDetails'].file_path === null">
                                                <figure class="widescreen desktop-only disabled">
                                                    <img src="" :data-img="$loadImg(media['mediaDetails'].backdrop)" :alt="`${media['mediaDetails'].title}`">
                                                </figure>
                                                <figure class="poster mobile-only disabled">
                                                    <img src="" :data-img="$loadImg(media['mediaDetails'].poster)" :alt="`${media['mediaDetails'].title}`">
                                                </figure>
                                            </template>

                                            <template v-else>
                                                <figure class="widescreen desktop-only">
                                                    <img src="" :data-img="$loadImg(media['mediaDetails'].backdrop)" :alt="`${media['mediaDetails'].title}`">
                                                </figure>
                                                <figure class="poster mobile-only">
                                                    <img src="" :data-img="$loadImg(media['mediaDetails'].poster)" :alt="`${media['mediaDetails'].title}`">
                                                </figure>
                                            </template>
                                            
                                            <div class="link-wrapper">
                                                <router-link v-if="media['mediaDetails'].file_path && media['mediaDetails'].media_type === 'movie'" :to="`/watch?id=${media['mediaDetails'].tmdbID}`" :title="`${media['mediaDetails'].title}`" class="play-trigger"></router-link>
                                                <router-link v-else-if="media['mediaDetails'].media_type === 'show' && media['episodes'][0].file_path" :to="`/watch?id=${media['episodes'][0].tmdbID}`" :title="`${media['episodes'][0].title}`" class="play-trigger"></router-link>
                                                
                                                <a href="#" @click="openMediaPopUp(media, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${slider.genre.genre_name}-media-${media['mediaDetails'].tmdbID}`"></a>
                                                <router-link :to="`/backend/${media['mediaDetails'].media_type}/${media['mediaDetails'].tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import functions from './mixins/functions.vue';
import langSnippet from './mixins/language.vue';

export default {
    name: 'AppIndex',
    mixins: [functions, langSnippet],
    data() {
        return {
            userID: null,
            highlight: null,
            availableGenre: null,
            availableSlider: null,
            availableSliderContent: null,
            url: window.location.protocol + '//' + window.location.hostname,
            popUpMediaContent: null,
        };
    },
    methods: {
        async genreSlider() {
            try {
                var slider = [];
                var currSlider = [];
                var mediaInfos = [];
                var media = [];
                var mediaGenre = [];
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreSlider`);
                var availableGenre = response.data;
                this.availableGenre = availableGenre;

                for ( var genre of availableGenre ) {
                    currSlider = [];
                    media = [];

                    try {
                        const mediaResponse = await this.genreMovies(genre.genre_id);
                        currSlider['genre'] = (genre);

                        for (let i = 0; i < mediaResponse.length; i++) {
                            mediaInfos = [];
                            mediaGenre = [];

                            try {
                                if ( mediaResponse[i].media_type === 'show' ) {
                                    mediaInfos['seasons'] = await this.getSeasons(mediaResponse[i].tmdbID);
                                    mediaInfos['episodes'] = await this.getEpisodes(mediaResponse[i].tmdbID);
                                }
                                console.log(mediaInfos['seasons']);
                                console.log(mediaInfos['episodes']);

                                var mediaGenreIDs = JSON.parse(mediaResponse[i].genres);
                                for (let x = 0; x < mediaGenreIDs.length; x++) {
                                    try {
                                        mediaGenre.push(await this.getGenre(mediaGenreIDs[x]));
                                        
                                    } catch(e) {
                                        console.log(e);
                                    }                                    
                                }

                                mediaInfos['genre'] = mediaGenre;
                                mediaInfos['mediaDetails'] = mediaResponse[i];
                                mediaInfos['mediaDetails']['watchlist_status'] = await this.checkWatchlist(mediaResponse[i].tmdbID);
                                media[i] = mediaInfos;
                                
                            } catch (error) {
                                console.log(error);
                            }
                        }

                        currSlider['mediaElements'] = media;

                    } catch(err) {
                        console.log(err);
                    }

                    slider.push(currSlider);
                }

                this.availableSlider = slider;
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
        async genreMovies(genreID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreMovies?genreID=${genreID}`);
                return response.data;
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
        async getHighlight() {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getHighlight`);
            } catch (err) {
                console.log(err);
            }

            this.highlight = response.data[0];
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
    },
    mounted() {
        this.sessionUser().then((userID) => {
            this.userID = userID;

            this.getHighlight();
            this.genreSlider().then(() => {
                this.availableSliderContent = this.availableSlider;
                document.getElementById('loader').classList.add('hidden');
            });
        });       
    }
};
</script>