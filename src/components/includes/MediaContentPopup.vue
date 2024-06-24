<template v-if="media">

        <!-- content -->
        <div class="info-popup" :id="id">
            <div class="col12 column">
                <div class="ambient-wrap" v-if="media.trailer">
                    <figure class="widescreen ambient">
                        <div :id="`trailer-copy`" class="player-copy"></div>
                    </figure>
                    <figure class="widescreen">
                        <div :id="`${media.trailer}`" class="player"></div>
                    </figure>
                </div>

                <div class="ambient-wrap" v-else>
                    <figure class="widescreen ambient">
                        <img :src="$loadImg(media.backdrop)" :alt="`${media.title}`">
                    </figure>
                    <figure class="widescreen">
                        <img :src="$loadImg(media.backdrop)" :alt="`${media.title}`">
                    </figure>
                </div>
            </div>

            <div class="innerWrap">
                <div class="col12 marg-top-xs">
                    <div class="col12">
                        <template v-if="media.tagline">
                                <p class="h4 marg-no" v-if="media.tagline">{{ media.title }}</p>
                                <p class="h6 italic">{{ media.tagline }}</p>
                        </template>
                        <p class="h4" v-else>{{ media.title }}</p>
                    </div>

                    <p class="small tag-list marg-bottom-base">
                        <span class="tag">{{ media.release_date }}</span>
                        <span class="tag">{{ Math.round(media.rating * 10) / 10 }}/10 ★</span>
                        <!-- <span class="tag">'.$extraInfo.'</span> -->
                    </p>

                    <div class="col12 row">
                        <!-- Play button -->
                        <span class="column marg-bottom-xs" v-if="media.file_path">
                            <a :href="`/w?id=${media.tmdbID}`" class="btn btn-small btn-white icon-left icon-play">{{ langSnippet('watch_now') }}</a>
                        </span>

                        <!-- Like button -->
                        <span class="column marg-bottom-xs">
                            <button v-if="media.in_watchlist === 0" @click="watchListTrigger($event, media.tmdbID)" :id="`btn-${media.tmdbID}`" :data-status="`${media.in_watchlist}`" class="btn btn-small btn-white icon-left icon-heart like-btn loading">{{ langSnippet('add_to_list') }}</button>
                            <button v-else @click="watchListTrigger($event, media.tmdbID)" :id="`btn-${media.tmdbID}`" :data-status="`${media.in_watchlist}`" class="btn btn-small btn-white icon-left icon-remove like-btn loading">{{ langSnippet('remove_from_list') }}</button>
                        </span>
                    </div>                    
                    
                    <p class="strong marg-no">{{ langSnippet('overview') }}</p>
                    <p class="small">{{ media.overview }}</p>

                    <p class="strong marg-no">{{ langSnippet('genres') }}</p>
                    <p class="tag-list marg-bottom-base small">
                        <span v-for="(genre, index) in JSON.parse(media.genre_names)" :key="index" class="tag">
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
                                                <img :src="$loadImg(episode.backdrop)" :alt="episode.title">
                                            </figure>
                                        </div>
                                        <div class="col-7 col-9-medium pad-left-xs">
                                            <p class="small strong marg-no">{{ langSnippet('episode') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                            <p class="small" style="color: var(--white-90);">{{ $truncate(episode.overview, 100) }}</p>
                                        </div>

                                        <div v-if="episode.file_path" class="link-wrapper">
                                            <a :href="`/w?id=${episode.tmdbID}`" :title="`${episode.title}`" class="play-trigger">
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
                                                <img :src="$loadImg(episode.backdrop)" :alt="episode.title">
                                            </figure>
                                        </div>
                                        <div class="col-7 col-9-medium pad-left-xs">
                                            <p class="small strong marg-no">{{ langSnippet('episode') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                            <p class="small" style="color: var(--white-90);">{{ $truncate(episode.overview, 100) }}</p>
                                        </div>

                                        <div v-if="media && episode.file_path" class="link-wrapper">
                                            <a :href="`/w?id=${episode.tmdbID}`" :title="`${episode.title}`" class="play-trigger" v-if="media">
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
            </div>

        </div>
</template>

<script>
import functions from '../functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'MediaContentPopup',
    mixins: [functions, langSnippet],
    props: ['media', 'id'],
    data() {
        return {
            player: null,
            ambientlight: null,
            videoID: null
        }
    },
}
</script>