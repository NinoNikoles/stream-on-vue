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

        <template v-if="availableSlider && allMedia">
            <div v-for="(slider, index) in availableSlider" :key="index" :class="`genre-slider genre-slider-${index} marg-top-l`">
                <div class="col12">
                    <div class="column column-space-2">
                        <h3>{{ slider.genre.genre_name }}</h3>
                    </div>

                    <div class="col12">
                        <div class="swiper card-slider column column-space-2">
                            <div class="swiper-wrapper">

                                <div v-for="(id, index) in slider.mediaIDs" :key="index" class="swiper-slide">
                                    <template v-for="(media, index) in allMedia" :key="index">
                                        <div class="media-card" v-if="media.tmdbID === id">
                                            <div class="media-card-wrapper">
                                                <template v-if="media.file_path === null">
                                                    <figure class="widescreen desktop-only disabled">
                                                        <img src="" :data-img="$loadImg(media.backdrop)" :alt="`${media.title}`">
                                                    </figure>
                                                    <figure class="poster mobile-only disabled">
                                                        <img src="" :data-img="$loadImg(media.poster)" :alt="`${media.title}`">
                                                    </figure>
                                                </template>

                                                <template v-else>
                                                    <figure class="widescreen desktop-only">
                                                        <img src="" :data-img="$loadImg(media.backdrop)" :alt="`${media.title}`">
                                                    </figure>
                                                    <figure class="poster mobile-only">
                                                        <img src="" :data-img="$loadImg(media.poster)" :alt="`${media.title}`">
                                                    </figure>
                                                </template>
                                                
                                                <div class="link-wrapper">
                                                    <router-link v-if="media.file_path && media.media_type === 'movie'" :to="`/watch?id=${media.tmdbID}`" :title="`${media.title}`" class="play-trigger"></router-link>
                                                    <router-link v-else-if="media.media_type === 'show' && media['episodes'][0].file_path" :to="`/watch?id=${media['episodes'][0].tmdbID}`" :title="`${media['episodes'][0].title}`" class="play-trigger"></router-link>
                                                    
                                                    <a :href="`#${media.tmdbID}`" @click="openMediaPopUp(media, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${slider.genre.genre_name}-media-${media.tmdbID}`"></a>
                                                    <router-link :to="`/backend/${media.media_type}/${media.tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                                                </div>
                                            </div>
                                        </div>

                                    </template>

                                </div>

                            </div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import axios from 'axios';
import functions from './mixins/functions.vue';
import langSnippet from './mixins/language.vue';

let mediaInfos = []

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
            allMedia: null
        };
    },
    methods: {
        async genreSlider() {
            try {
                var slider = [];
                var currSlider = [];
                var media = [];
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreSlider`);
                var availableGenre = response.data;
                this.availableGenre = availableGenre;

                for ( var genre of availableGenre ) {
                    currSlider = [];
                    media = [];

                    try {
                        const mediaResponse = await this.genreMovies(genre.genre_id);

                        for (let i = 0; i < mediaResponse.length; i++) {
                            if ( !mediaInfos.includes(mediaResponse[i].tmdbID) ) {
                                mediaInfos.push(mediaResponse[i].tmdbID);
                            }
                            media.push(mediaResponse[i].tmdbID);
                        }
                    } catch(error) {
                        console.log(error);
                    }

                    currSlider['genre'] = (genre);
                    currSlider['mediaIDs'] = (media);

                    slider.push(currSlider);
                }

                this.availableSlider = slider;
                var ids = mediaInfos;
                this.allMedia = await this.getAllMediaInfos(ids);
            } catch (error) {
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
        }
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