<template>
    <div id="mainPlayer" class="mainPlayer fullscreen" v-if="media">
        <figure>
            <video-player :options="player.options" v-if="player.options.sources[0].src"></video-player>
            <a :href="`/watchTogether?id=${$route.query.id}&uuid=${uuid}`" id="player-session-btn" title="Group session" v-if="uuid"></a>
            <button id="chat-open" @click="toggleChat($event)"></button>
        </figure>

        <!-- <div id="chat">    
            <div class="chat-wrap grid-padding">
                <p id="chat-headline" class="text-center pad-top-xs pad-bottom-xs"><button id="chat-close" class="icon icon-close" @click="toggleChat($event)"></button>Chat</p> -->
                
                <!--- Messages will be displayed here --->
                <!-- <div id="message-wrap"></div> -->
                <!--- --->

                <!-- <div id="input-wrap" class="pad-top-xs marg-top-xs marg-bottom-xs">
                    <label for="message-input" class="marg-right-xs">
                        <input type="text" id="message-input" name="message-input" class="marg-no" :placeholder="langSnippet('message')">
                    </label>
                    <input type="number" style="display:none;" id="message-use-id" name="message-use-id" :value="user.id">
                    <input type="text" style="display:none;" id="message-use-name" name="message-use-name" :value="user.username">
                    <button class="btn btn-small btn-white marg-no" id="chatMSG">{{ langSnippet('send') }}</button>
                </div> -->
            <!-- </div> -->
        <!-- </div> -->

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
            mediaID: null,
            uuid: null,
            media: null,
            seasons: null,
            show: null,
            player: {
                el: null,
                currentTime: null,
                duration: null,
                ended: false,
                options: {
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
                            src: null,
                            type: 'video/mp4'
                        }
                    ],
                    userActions: {
                        click: true
                    }
                },
            },
        };
    },
    methods: {
        async definePlayer() {
            var playerClass = document.getElementsByClassName('video-js');
            this.player.el = videojs(playerClass[0].id);
        },
        async getMedia(tmdbID) {
            if ( tmdbID !== null && tmdbID !== undefined ) {
                try {
                    var response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);
                    if ( response.data.length === 0) response = await axios.get(`${this.$mainURL}:3000/api/db/episode?tmdbID=${tmdbID}`);
                    this.media = response.data[0];
                    console.log(this.media);
                    this.player.options.sources[0].src = `${this.$mainURL}:8080/${this.media.file_path.replace('/public/', '')}`;

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
        async setPlayerTime(time = 0, duration = null) {
            this.player.currentTime = time;
            this.player.el.currentTime(time);
            this.player.duration = duration;
        },
        async setPlayerStartTime() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getMediaWatched?mediaID=${this.mediaID}&userID=${this.$user.id}`);

                await this.setPlayerTime();
                if ( response.data ) this.setPlayerTime(response.data.watched_seconds, response.data.total_length);

            } catch(err) {
                console.log(err);
            }
        },
        async saveUserVolume() {
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/saveUserVolume?userID=${this.$user.id}&volume=${this.$user.volume}`);
            } catch(err) {
                console.log(err);
            }
        },

        async setUpPlayer(mediaID) {
            try {
                await this.getMedia(mediaID);
                console.log(this.media.media_type);
                if ( this.media.media_type === 'show') await this.getShow(this.media.show_id);

                await this.definePlayer();

                this.player.el.ready(async() => {
                    console.log('ready');

                    await this.setPlayerStartTime();

                    this.player.el.on('durationchange', async () => {
                        if ( this.$user.volume === undefined ) this.$user.volume = 1;

                        await this.playerFunctions();
                    });
                });

                await this.generateUUID();
            } catch(err) {
                console.log(err);
            }
        },

        async playerFunctions() {
            var playerEL = this.player.el;
            var player = this.player;

            playerEL.volume(this.$user.volume);

            player.duration = playerEL.duration();

            if ( player.currentTime === player.duration ) {
                player.currentTime = 0;
            }

            playerEL.currentTime(player.currentTime);
            var interval = false;

            playerEL.on('play', () => {
                this.isVideoEnded = false;
                clearInterval(interval);
                this.saveTime(playerEL.currentTime());
                interval = setInterval(() => {
                    this.saveTime(playerEL.currentTime());
                }, 30000);
            });

            playerEL.on('seeking', () => {
                var playerClass = document.getElementsByClassName('video-js');
                var newPlayer = document.getElementById(playerClass[0].id);

                if ( newPlayer.classList.contains('vjs-scrubbing') ) {
                    clearInterval(interval);
                    this.saveTime(playerEL.currentTime());
                    interval = setInterval(() => {
                        this.saveTime(playerEL.currentTime());
                    }, 30000);
                }            
            });

            playerEL.on('ended', () => {
                this.isVideoEnded = true;
                clearInterval(interval);
                this.saveTime(player.duration);
            });

            playerEL.on('pause', () => {     
                clearInterval(interval);                   
                if ( playerEL.currentTime() !== player.duration) {
                    this.saveTime(playerEL.currentTime());
                } else {
                    this.isVideoEnded = true;
                    this.saveTime(player.duration);
                }
            });

            playerEL.on('volumechange', () => {
                this.$user.volume = playerEL.volume();
                this.saveUserVolume();
            });
        },
    },
    watch: {
        '$route'(to, from) {
            // Überprüfe, ob sich die ID geändert hat
            if (to.query.id !== from.query.id) {
                // Führe deine Funktion aus
                this.setUpPlayer(this.$route.query.id);
            }
        }
    },
    mounted() {
        this.setUpPlayer(this.$route.query.id);
    }
};
</script>

<style>
#app {

}
</style>
