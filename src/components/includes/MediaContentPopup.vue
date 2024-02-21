<template>
    <template v-if="media">
        <div class="info-popup" :id="`${media.tmdbID}`">
            <div class="col12 marg-bottom-xs mobile-only">
                <figure class="widescreen">
                    <img :data-img="$loadImg(media.backdrop)" loading="lazy" importance="low" alt="">
                </figure>
            </div>
            <div class="innerWrap">
                <div class="col7 marg-right-col1">
                    <div class="col12">
                        <div class="col-9">
                            <p class="h2">{{ media.title }}</p>
                        </div>

                        <div class="col-3">
                            <p class="text-right">
                                <!-- Like button -->
                                <button @click="watchListAction(media.tmdbID, `btn-${media.tmdbID}`)" :id="`btn-${media.tmdbID}`" :data-status="`${media.watchlist_status}`" class="btn btn-small btn-white hollow icon-only like-btn marg-no"></button>
                            </p>
                        </div>
                    </div>

                    <p class="small tag-list marg-bottom-base">
                        <span class="tag">{{ media.release_date }}</span>
                        <span class="tag">{{ media.rating }}/10 ★</span>
                        <!-- <span class="tag">'.$extraInfo.'</span> -->
                    </p>

                    <!-- Play button -->
                    <button v-if="media.file_path" href="#" class="btn btn-small btn-white icon-left icon-play marg-right-no">{{ langSnippet('watch_now') }}</button>
                    
                    <p class="small">{{ media.overview }}</p>
                    <p v-if="media['genre']" class="small tag-list marg-bottom-base">
                        <span v-for="(genre, index) in media['genres']" :key="index" class="tag">
                            {{ genre }}
                        </span>
                    </p>

                    <template v-if="media.media_type === 'show'">
                        <p>
                            <label>{{ langSnippet('seasons') }}
                                <select :class="`tab-select season-select-${media.tmdbID}`" :id="`season-select-${media.tmdbID}`" @change="SelectTabs($event)">
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
                            <div v-if="season.season_number === 1" :class="`col12 select-tab-content season-select-${media.tmdbID} is-active marg-bottom-base`" :data-select-tab="`${season.season_number}`">
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
                            <div v-else :class="`col12 select-tab-content season-select-${media.tmdbID} marg-bottom-base`" :data-select-tab="`${season.season_number}`">
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

                                        <div v-if="media && episode.file_path" class="link-wrapper">
                                            <a :href="`/watch?s=${episode.tmdbID}`" :title="`${episode.title}`" class="play-trigger" v-if="media">
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
                        <img :data-img="$loadImg(media.poster)" alt="" loading="lazy" importance="low" v-if="media">
                    </figure>
                </div>
            </div>
        </div>
    </template>
</template>

<script>
//import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'MediaContentPopup',
    mixins: [functions, langSnippet],
    props: ['media'],
    data() {
        return {
            userID: null
        }
    },
    methods: {
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.userID, mediaID, buttonID);
        },
    },
    updated() {
        this.sessionUser().then((userID) => {
            this.userID = userID;
        });
    }
}
</script>