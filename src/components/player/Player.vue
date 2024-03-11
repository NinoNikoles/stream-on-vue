<template>
    <div id="mainPlayer" class="mainPlayer fullscreen" v-if="media">
        <figure>
            <video-player :options="videoOptions" v-if="videoOptions.sources[0].src !== ''"></video-player>
            <a :href="`/watchTogether?id=${$route.query.id}&uuid=${uuid}`" id="player-session-btn" title="Group session" v-if="uuid"></a>
        </figure>

        <!-- <span :data-time="`${watchedTime}`" :data-media="`${mediaID}`" :data-volume="`${volume}`" id="time"></span> -->
    </div>
</template>

<script>
import axios from 'axios';
import videojs from 'video.js';
//import { Fancybox } from '@fancyapps/ui';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
import VideoPlayer from '../VideoJS.vue';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'MediaPlayer',
    mixins: [langSnippet, mainFunctions],
    components: {
        VideoPlayer
    },
    data() {
        return {
            mediaID: this.$route.query.id,
            uuid: null,
            media: null,
            seasons: null,
            show: null,
            type: null,
            player: null,
            videoOptions: {
                controls: true,
                duration: true,
                preload: 'auto',
                autoplay: false,
                controlBar: {
                    skipButtons: {
                        forward: 10,
                        backward: 10
                    },
                    volumePanel: {
                        inline: false,
                    },
                    pictureInPictureToggle: false,
                },
                sources: [
                    {
                        src: '',
                        type: 'video/mp4'
                    }
                ],
                userActions: {
                    click: true
                }
            },
            user: {
                id: null,
                username: null,
                volume: null,
            },
            currentTime: null,
            duration: null,
            isVideoEnded: false
        };
    },
    methods: {
        async getMedia(tmdbID) {
            if ( tmdbID !== null && tmdbID !== undefined ) {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);

                    if ( response.data.length > 0 ) {
                        this.media = response.data[0];
                        this.type = 'movie';
                        this.videoOptions.sources[0].src = `${this.$mainURL}:8080/${this.media.file_path.replace('/public/', '')}`;
                    } else {
                        const newResponse = await axios.get(`${this.$mainURL}:3000/api/db/episode?tmdbID=${tmdbID}`);
                        this.media = newResponse.data[0];
                        this.type = 'show';
                        this.videoOptions.sources[0].src = `${this.$mainURL}:8080/${this.media.file_path.replace('/public/', '')}`;
                    }

                } catch (error) {
                    console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                    return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
                }         
            }
        },
        async getShow(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${showID}`);
                this.show = response.data[0];
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async generateUUID() {
            if ( this.$route.query.uuid === null || this.$route.query.uuid === undefined) {
                this.uuid = uuidv4();
            }
        },
        async definePlayer() {
            var playerClass = document.getElementsByClassName('video-js');
            this.player = videojs(playerClass[0].id);
        },
        async fetchSessionStatus() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                
                if ( response.data.user ) {
                    const newResponse = await axios.get(`${this.$mainURL}:3000/api/db/getUser?userID=${response.data.user.id}`);
                    const user = newResponse.data[0];
                    this.user.id = user.id;
                    this.user.username = user.username;
                    this.user.volume = user.media_volume;
                    if ( this.user.volume === null ) this.user.volume = 1;
                }               
            } catch (error) {
                console.error('Fehler beim Abrufen des Session-Status:', error);
            }
        },
        async saveTime(currentTime) {
            this.duration = this.player.duration();
            var showID = null;
            var watched = 0;
            if ( this.show !== null ) showID = this.show.tmdbID;

            var nextMediaID = false;
            var nextCurrentSecond = false;
            var nextTotalDuration = false;
            var nextWatched = false;

            if ( currentTime === this.duration ) {
                watched = 1;

                // if ( $('#next-episode-btn').length > 0 ) {
                //     $nextBtn = $('#next-episode-btn');
                //     nextMediaID = $nextBtn.attr('data-id');
                //     nextCurrentSecond = $nextBtn.attr('data-current-time');
                //     if ( nextCurrentSecond == 0 ) {
                //         nextCurrentSecond = 0.000001;
                //     }
                //     nextTotalDuration = $nextBtn.attr('data-length');
                //     nextWatched = 0;
                // }
            }

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/safeWatchTime`, {
                    userID: this.user.id,
                    mediaID: this.mediaID,
                    nextMediaID: nextMediaID,
                    showID: showID,
                    currentTime: currentTime,
                    nextTime: nextCurrentSecond,
                    watched: watched,
                    nextWatched: nextWatched,
                    totalLength: this.duration,
                    nextTotalLength: nextTotalDuration,
                });
            } catch(err) {
                console.log(err);
            }
        },
        async setStartTime() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getMediaWatched?mediaID=${this.mediaID}&userID=${this.user.id}`);
                var data = response.data

                if ( data ) {
                    this.currentTime = data.watched_seconds;
                    this.duration = data.total_length;
                    this.player.currentTime(this.currentTime);
                } else {
                    this.currentTime = 0;
                    this.player.currentTime(0);
                }

                this.player.play();
                
            } catch(err) {
                console.log(err);
            }
        },
        async saveUserVolume() {
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/saveUserVolume?userID=${this.user.id}&volume=${this.user.volume}`);
            } catch(err) {
                console.log(err);
            }
        }
    },
    mounted() {
        this.getMedia(this.mediaID).then(() => {
            if ( this.type === 'show' ) {
                this.getShow(this.media.show_id);
            }

            // Sets player
            this.definePlayer().then(() => {
                // When all player informations are loaded
                this.player.ready(() => {
                    // Get user data
                    this.fetchSessionStatus().then(() => {
                        // Sets start time for video
                        this.setStartTime().then(() => {
                            this.player.on('durationchange', () => {
                                this.player.volume(this.user.volume);

                                this.duration = this.player.duration();

                                if ( this.currentTime === this.duration ) {
                                    this.currentTime = 0;
                                }

                                this.player.currentTime(this.currentTime);
                                var interval = false;

                                this.player.on('play', () => {
                                    this.isVideoEnded = false;
                                    clearInterval(interval);
                                    this.saveTime(this.player.currentTime());
                                    interval = setInterval(() => {
                                        this.saveTime(this.player.currentTime());
                                    }, 30000);
                                });

                                this.player.on('seeking', () => {
                                    var playerClass = document.getElementsByClassName('video-js');
                                    var newPlayer = document.getElementById(playerClass[0].id);

                                    if ( newPlayer.classList.contains('vjs-scrubbing') ) {
                                        clearInterval(interval);
                                        this.saveTime(this.player.currentTime());
                                        interval = setInterval(() => {
                                            this.saveTime(this.player.currentTime());
                                        }, 30000);
                                    }            
                                });

                                this.player.on('ended', () => {
                                    this.isVideoEnded = true;
                                    clearInterval(interval);
                                    this.saveTime(this.duration);
                                });

                                this.player.on('pause', () => {     
                                    clearInterval(interval);                   
                                    if ( this.player.currentTime() !== this.duration) {
                                        this.saveTime(this.player.currentTime());
                                    } else {
                                        this.isVideoEnded = true;
                                        this.saveTime(this.duration);
                                    }
                                });

                                this.player.on('volumechange', () => {
                                    this.user.volume = this.player.volume();
                                    this.saveUserVolume();
                                });
                            })
                        });
                    });
                });
            });
        });

        this.generateUUID();
    }
};
</script>

<style>
#app {

}
</style>
