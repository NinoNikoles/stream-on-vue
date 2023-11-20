<template>
    <div v-if="highlight" class="highlight-wrapper">
        <figure class="widescreen"><img data-img="http://localhost:8080/build/css/images/img_preview.webp" loading="lazy" :alt="`${highlight.title}`"></figure>
        <figure class="poster"><img data-img="http://localhost:8080/build/css/images/img_preview.webp" loading="lazy" :alt="`${highlight.title}`"></figure>
        <div class='content-wrap mobile-only'>
            <h1 class="h1 text-center">{{  highlight.title }}</h1>
            <p class="small">{{  highlight.overview }}</p>
        </div>
        <div class='content-wrap desktop-only'>
            <h1 class="h2 text-center">{{  highlight.title }}</h1>
            <p>{{  highlight.overview }}</p>
        </div>
    </div>

    <div v-if="availableSlider" class="marg-bottom-xl">
        <div v-for="(slider, index) in availableSlider" :key="index" :class="`genre-slider genre-slider-${index}`">
            <div class="col12 marg-top-xl">
                <div class="column column-space-2">
                    <h3>{{ slider.genre.genre_name }}</h3>
                </div>

                <div class="col12">
                    <div class="swiper card-slider column column-space-2">
                        <div class="swiper-wrapper">
                            <div v-for="(media, index) in slider.mediaElements" :key="index" class="swiper-slide">
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
                                            <a href="#" @click="selectMedia(media)" :title="langSnippet('more_informations')" class="info-trigger" data-modal :data-src="`${media.tmdbID}`"></a>
                                            <a :href="`/backend/${media.media_type}/${media.tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></a>
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

    <div class="modal" id="modal">
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
import langSnippet from './api/language.vue';
//import { Swiper, SwiperSlide } from 'swiper/vue';

export default {
    name: 'AppIndex',
    mixins: [langSnippet],
    data() {
        return {
            highlight: null,
            availableGenre: null,
            availableSlider: null,
            selectedMedia: null,
            selectedMediaGenre: null,
            url: window.location.protocol + '//' + window.location.hostname
        };
    },

    methods: {
        async genreSlider() {
            try {
                var slider = [];
                var currSlider = [];
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreSlider`);
                var availableGenre = response.data;
                this.availableGenre = availableGenre;

                for ( var genre of availableGenre ) {
                    currSlider = [];
                    try {
                        const moviesResponse = await this.genreMovies(genre.genre_id);
                        currSlider['genre'] = (genre);
                        currSlider['mediaElements'] = (moviesResponse);
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

            if ( this.selectedMedia.media_type === 'show' ) {
                console.log('has seasons');
            }

            
        },
        async getHighlight() {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getHighlight`);
            } catch (err) {
                console.log(err);
            }

            this.highlight = response.data[0];
        }
    },
    mounted() {
        this.getHighlight();
        this.genreSlider();
    }
};
</script>