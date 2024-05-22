<template>
    <template v-if="media">

        <!-- content -->
        <div class="info-popup" :id="id">
            <div class="col12">

            </div>
            <div class="col12 ambient-wrap pad-top-s pad-bottom-s">
                <figure v-if="media.trailer" class="widescreen ambient">
                    <div :id="`trailer-copy`" class="player-copy"></div>
                </figure>
                <div class="innerWrap">
                    <div class="col12 pad-left-s pad-right-s">
                        <figure v-if="media.trailer" class="widescreen">
                            <div :id="`${media.trailer}`" class="player"></div>
                        </figure>
                    </div>
                </div>
            </div>

            <div class="innerWrap">
                <div class="col12 marg-top-s pad-left-base pad-right-base">
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
                    <p class="small tag-list marg-bottom-base">
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
                                                <img :src="$loadImg(episode.backdrop)" :alt="episode.title">
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
            </div>
        </div>


    </template>
</template>

<script>
import functions from '../mixins/functions.vue';
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
    methods: {
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.$user.id, mediaID, buttonID);
        },
        // initYT() {
        //     if (!window.YT) {
        //         const tag = document.createElement('script');
        //         tag.src = "https://www.youtube.com/iframe_api";
        //         const firstScriptTag = document.getElementsByTagName('script')[0];
        //         firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        //         console.log(tag);
        //         // Warten auf die Initialisierung der API
        //         window.onYouTubeIframeAPIReady = this.initializePlayers;
        //         // this.initPlayer();

        //     } else {
                
        //     }
        // },
        // async initPlayer() {
        //     this.videoID = this.media.trailer;
        //     // var player;
        //     // var ambientlight;
        //     // var ambientReady = false;

        //     const player = new window.YT.Player('trailer-'+this.videoID, {
        //         height: '1920',
        //         width: '1080',
        //         videoId: this.videoID,
        //         playerVars: {
        //             'enablejsapi': 1,
        //             'origin': 'http://localhost:8080/'
        //         },
        //         events: {
        //             'onReady': onPlayerReady,
        //             'onStateChange': onPlayerStateChange,
        //             'onPlaybackRateChange': onPlaybackRateChange
        //         }
        //     });

        //     const ambientlight = new window.YT.Player('trailer-copy', {
        //         height: '1920',
        //         width: '1080',
        //         videoId: this.videoID,
        //         playerVars: {
        //             'enablejsapi': 1,
        //             'mute': 1,
        //             'origin': 'http://localhost:8080/'
        //         },
        //         events: {
        //             'onReady': onCopyReady
        //         }
        //     });

        //     function onPlayerReady() {
        //         console.log('rdy');
        //     }
            
        //     function onCopyReady() {
        //         // Das kopierte Video ist bereit
        //         // ambientReady = true;
        //         ambientlight.mute();
        //     }

        //     function onPlayerStateChange(event) {
        //         // if (!ambientReady) return;
        //         console.log('Player state changed:', event.data);
        //         // switch (event.data) {
        //         //     case window.YTplayer.PlayerState.PLAYING:
        //         //     ambientlight.playVideo();
        //         //     break;
        //         //     case window.YT.PlayerState.PAUSED:
        //         //     ambientlight.pauseVideo();
        //         //     break;
        //         //     case window.YT.PlayerState.ENDED:
        //         //     ambientlight.seekTo(0);
        //         //     ambientlight.pauseVideo();
        //         //     break;
        //         // }

        //         // if (event.data == YT.PlayerState.ENDED && !done && highlight) {
        //         //     setTimeout(hideVideo, 1000);
        //         //     done = true;
        //         // }
        //     }

        //     // function onPlaybackRateChange() {
        //     //     if (!ambientlight) return;
        //     //     ambientlight.setPlaybackRate(player.getPlaybackRate());
        //     // }

        //     // setInterval(function() {
        //     //     if (!ambientlight) return;
        //     //     var currentTime = player.getCurrentTime();
        //     //     if (Math.abs(currentTime - ambientlight.getCurrentTime()) > 0.5) {
        //     //         ambientlight.seekTo(currentTime, true);
        //     //     }
        //     // }, 100);
        // }        
    },
    mounted() {
        window.YTplayer();
    }
}
</script>