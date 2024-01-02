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
                                                
                                                
                                                
                                                <a href="#" @click="openPopUp(`${slider.genre.genre_name}-media-${media['mediaDetails'].tmdbID}`, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${slider.genre.genre_name}-media-${media['mediaDetails'].tmdbID}`"></a>
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

    <template v-if="availableSliderContent">
        <template v-for="(slider, index) in availableSliderContent" :key="index">
            <template v-for="(media, index) in slider.mediaElements" :key="index">
                <div class="modal" :id="`${slider.genre.genre_name}-media-${media['mediaDetails'].tmdbID}`">
                    <div class="modal-overlay"></div>
                    <div class="modal-wrap large">
                        <div class="modal-inner-wrap">
                            <div class="info-popup" :id="`${media['mediaDetails'].tmdbID}`">
                                <div class="col12 marg-bottom-xs mobile-only">
                                    <figure class="widescreen">
                                        <img :data-img="$loadImg(media['mediaDetails'].backdrop)" loading="lazy" importance="low" alt="">
                                    </figure>
                                </div>
                                <div class="innerWrap">
                                    <div class="col7 marg-right-col1">
                                        <p class="h2">{{ media['mediaDetails'].title }}</p>
                                        <p class="small tag-list marg-bottom-base">
                                            <span class="tag">{{ media['mediaDetails'].release_date }}</span>
                                            <span class="tag">{{ media['mediaDetails'].rating }}/10 ★</span>
                                            <!-- <span class="tag">'.$extraInfo.'</span> -->
                                        </p>
                                        <a v-if="media['mediaDetails'].file_path" href="#" class="btn btn-small btn-white icon-left icon-play marg-right-xs">{{ langSnippet('watch_now') }}</a>
                                        <p class="small">{{ media['mediaDetails'].overview }}</p>
                                        <p v-if="media['genre']" class="small tag-list marg-bottom-base">
                                            <span v-for="(genre, index) in media['genre']" :key="index" class="tag">
                                                {{ genre }}
                                            </span>
                                        </p>

                                        <template v-if="media['mediaDetails'].media_type === 'show'">
                                            <p>
                                                <label>{{ langSnippet('seasons') }}
                                                    <select :class="`tab-select season-select-${media['mediaDetails'].tmdbID}`" :id="`${slider.genre.genre_name}-season-select-${media['mediaDetails'].tmdbID}`" @change="SelectTabs($event)">
                                                        <template v-for="(season, index) in media['seasons']" :key="index">
                                                            <option v-if="season.title !== 'Extras'" :value="`${season.season_number}`">
                                                                {{ season.title }}
                                                            </option>
                                                        </template>
                                                        <!-- Extras always get shown at the end  -->
                                                        <option v-if="media['seasons'][0].title === 'Extras'" :value="`${media['seasons'][0].season_number}`">
                                                            {{ media['seasons'][0].title }}
                                                        </option>
                                                    </select>
                                                </label>
                                            </p>

                                            <template v-for="(season, index) in media['seasons']" :key="index">
                                                <div v-if="season.season_number === 1" :class="`col12 select-tab-content ${slider.genre.genre_name}-season-select-${media['mediaDetails'].tmdbID} is-active marg-bottom-base`" :data-select-tab="`${season.season_number}`">
                                                    <template v-for="(episode, index) in media['episodes']" :key="index">
                                                        <div v-if="episode.season_number === season.season_number" :class="`col12 media-card-episode pad-top-xs pad-bottom-xs`">
                                                            <div class="col-5 col-3-medium">
                                                                <figure class="widescreen">
                                                                    <img :data-img="$loadImg(episode.backdrop)" :alt="episode.title">
                                                                </figure>
                                                            </div>
                                                            <div class="col-7 col-9-medium pad-left-xs">
                                                                <p class="small strong marg-no">{{ langSnippet('episode') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                                                <p class="small">{{ $truncate(episode.overview, 100) }}</p>
                                                            </div>

                                                            <div v-if="episode.file_path" class="link-wrapper">
                                                                <a :href="`/watch?s=${episode.tmdbID}`" :title="`${episode.title}`" class="play-trigger">
                                                                    <span class="icon-wrap col-5 col-3-medium pad-top-xs pad-bottom-xs">
                                                                        <i class="icon-play"></i>
                                                                    </span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                                <div v-else :class="`col12 select-tab-content ${slider.genre.genre_name}-season-select-${media['mediaDetails'].tmdbID} marg-bottom-base`" :data-select-tab="`${season.season_number}`">
                                                    <template v-for="(episode, index) in media['episodes']" :key="index">
                                                        <div v-if="episode.season_number === season.season_number" :class="`col12 media-card-episode pad-top-xs pad-bottom-xs`">
                                                            <div class="col-5 col-3-medium">
                                                                <figure class="widescreen">
                                                                    <img :data-img="$loadImg(episode.backdrop)" :alt="episode.title">
                                                                </figure>
                                                            </div>
                                                            <div class="col-7 col-9-medium pad-left-xs">
                                                                <p class="small strong marg-no">{{ langSnippet('episode') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                                                <p class="small">{{ $truncate(episode.overview, 100) }}</p>
                                                            </div>

                                                            <div v-if="episode.file_path" class="link-wrapper">
                                                                <a :href="`/watch?s=${episode.tmdbID}`" :title="`${episode.title}`" class="play-trigger">
                                                                    <span class="icon-wrap col-5 col-3-medium pad-top-xs pad-bottom-xs">
                                                                        <i class="icon-play"></i>
                                                                    </span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>
                                        </template>


                                    </div>
                                    <div class="col4 desktop-only">
                                        <figure class="poster">
                                            <img :data-img="$loadImg(media['mediaDetails'].poster)" alt="" loading="lazy" importance="low">
                                        </figure>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <a href="#" class="modal-close" @click="closePopUp(`${slider.genre.genre_name}-media-${media['mediaDetails'].tmdbID}`, $event)"></a>
                    </div>
                </div>
            </template>
        </template>
    </template>

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
            highlight: null,
            availableGenre: null,
            availableSlider: null,
            availableSliderContent: null,
            url: window.location.protocol + '//' + window.location.hostname
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
                                media[i] = mediaInfos;
                                
                            } catch (error) {
                                console.log(error);
                            }
                        }

                        currSlider['mediaElements'] = media;
                        console.log(currSlider['mediaElements']);

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
        }
    },
    mounted() {
        this.getHighlight();
        this.genreSlider().then(() => {
            document.getElementById('loader').classList.add('hidden');
            this.availableSliderContent = this.availableSlider;
        });
    }
};
</script>