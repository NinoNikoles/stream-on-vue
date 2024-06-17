<template>
    <div id="mainPlayer" class="mainPlayer fullscreen" v-if="media">
        <figure>
            <video class="video-js" id="main-video">
                <source :src="src">
            </video>

            <router-link id="player-back-btn" :to="lastPath" title=""></router-link>
            <a id="player-session-btn" :href="`/w?id=${$route.query.id}&uuid=${uuid}`" title="Group session" v-if="uuid && !$route.query.uuid"></a>
            
            <button id="chat-open" @click="toggleChat($event)" v-show="multiWatch"></button>

            <a :href="`/w?id=${show.nextEpisode.tmdbID}`" id="next-episode-btn" class="next-episode-btn" v-if="show.nextEpisode">
                <figure class="widescreen"><img :src="$loadImg(show.nextEpisode.backdrop)"><i class="icon icon-play"></i></figure>
                <span>{{ langSnippet('next_episode') }}</span>
            </a>

            <button href="#" id="show-eps-btn" @click="toggleShowMenu($event)" class="icon icon-multilayer" title="All episodes" v-if="show.episodes"></button>

            <div id="show-container" v-if="show.seasons">
                <ul class="menu">

                    <template v-for="(season, index) in show.seasons" :key="index">
                        <li v-if="season && show.seasons[index].season_number !== 0" class="list-item">
                            <a href="#" @click="openSeasonContainer($event, season.tmdbID)">
                                {{ season.title }}
                                <span class="icon-right icon-chevron-right">
                                    {{ season.episodes_count }} {{ langSnippet('episodes') }}
                                </span>
                            </a>
                        </li>
                    </template>

                    <li v-if="show.seasons && show.seasons[0].season_number === 0" class="list-item">
                        <a href="#" @click="openSeasonContainer($event, show.seasons[0].tmdbID)">
                            {{ show.seasons[0].title }}
                            <span class="icon-right icon-chevron-right">
                                {{ show.seasons[0].episodes_count }} {{ langSnippet('episodes') }}
                            </span>
                        </a>
                    </li>
                </ul>

                <ul class="sub-menu" :id="season.tmdbID" v-for="(season, index) in show.seasons" :key="index">
                    <a href="#" @click="closeSeasonContainer($event)" class="back icon-left icon-chevron-left">{{ langSnippet('seasons') }}</a>

                    <template v-for="(episode, index) in show.episodes" :key="index">
                        <li class="list-item pad-left-xxs pad-right-xxs active" v-if="episode.season_number === season.season_number && episode.tmdbID === media.tmdbID">
                            <div class="col12 media-card-episode pad-top-xxs pad-bottom-xxs">
                                <div class="col-3">
                                    <figure class="widescreen">
                                        <img :src="$loadImg(episode.backdrop)">
                                    </figure>
                                </div>
                                <div class="col-9 pad-left-xxs">
                                    <p class="small strong marg-no">
                                        {{ langSnippet('episodes') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                    <p class="smaller">{{ $truncate(episode.overview, 100) }}</p>
                                </div>
                            </div>
                        </li>

                        <li class="list-item pad-left-xxs pad-right-xxs" v-if="episode.season_number === season.season_number && episode.tmdbID !== media.tmdbID">
                            <div class="col12 media-card-episode pad-top-xxs pad-bottom-xxs">
                                <div class="col-3">
                                    <figure class="widescreen">
                                        <img :src="$loadImg(episode.backdrop)">
                                    </figure>
                                </div>
                                <div class="col-9 pad-left-xxs">
                                    <p class="small strong marg-no">
                                        {{ langSnippet('episodes') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                    <p class="smaller">{{ $truncate(episode.overview, 100) }}</p>
                                </div>
                                
                                <div class="link-wrapper" v-if="episode.file_path">
                                    <a :href="`/w?id=${episode.tmdbID}`" v-if="uuid && !$route.query.uuid" class="play-trigger" :title="`${langSnippet('episode')} ${episode.episode_number}:  ${episode.title}`">
                                        <span class="icon-wrap col-3 pad-top-xxs pad-bottom-xxs">
                                            <i class="icon-play"></i>
                                        </span>
                                    </a>
                                    <a :href="`/w?id=${episode.tmdbID}&uuid=${uuid}`" v-else class="play-trigger" :title="`${langSnippet('episode')} ${episode.episode_number}:  ${episode.title}`">
                                        <span class="icon-wrap col-3 pad-top-xxs pad-bottom-xxs">
                                            <i class="icon-play"></i>
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </figure>

        <div id="chat" v-if="$route.query.uuid">    
            <div class="chat-wrap grid-padding">
                <p id="chat-headline" class="text-center pad-top-xs pad-bottom-xs"><button id="chat-close" class="icon icon-close" @click="toggleChat($event)"></button>Chat</p>
                
                <!--- Messages will be displayed here --->
                <div id="message-wrap"></div>

                <div id="input-wrap" class="pad-top-xs marg-top-xs marg-bottom-xs">
                    <label for="message-input" class="marg-right-xs">
                        <input type="text" id="message-input" name="message-input" class="marg-no" v-model="userMessage" :placeholder="langSnippet('message')">
                    </label>
                    <button class="btn btn-small btn-white marg-no" id="chatMSG">{{ langSnippet('send') }}</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios';
import videojs from 'video.js';
//import { Fancybox } from '@fancyapps/ui';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'MediaPlayer',
    mixins: [langSnippet, mainFunctions],
    data() {
        return {
            lastPath: '/',
            mediaID: null,
            media: null,
            uuid: null,
            show: {
                info: null,
                seasons: null,
                episodes: null,
                lastEpisode: null,
                nextEpisode: null
            },
            multiWatch: false,
            src: null,
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
                    // src: null,
                    // sources: [
                    //     {
                    //         src: null,
                    //         type: 'video/mp4'
                    //     }
                    // ],
                    userActions: {
                        click: true
                    }
                },
            },
            socket: null,
            userMessage: ''
        };
    },
    methods: {
        async definePlayer() {
            this.$nextTick(() => {
                const videoElement = document.getElementById('main-video');
                return videoElement;
            });
        },
        async getMedia(tmdbID) {
            if ( tmdbID !== null && tmdbID !== undefined ) {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);
                if ( response.data.length === 0) response = await axios.get(`${this.$mainURL}:3000/api/db/episode?tmdbID=${tmdbID}`);

                console.log(`${this.$mainURL}:8080/${response.data[0].file_path.replace('/public/', '')}`);
                this.src = `/${response.data[0].file_path.replace('/public/', '')}`;

                return new Promise((resolve) => {
                    resolve(response.data[0]);
                });      
            }
        },
        async getShow(showID) {
            try {
                const responseShow = await this.get(`SELECT * FROM media WHERE tmdbID = ${showID}`);
                const responseSeasons = await this.get(`SELECT * FROM seasons WHERE show_tmdbID = ${showID}`);
                const responseEpisodes = await this.get(`SELECT * FROM episodes WHERE show_id = ${showID}`);

                var show = {
                    info: responseShow[0],
                    seasons: responseSeasons,
                    episodes: responseEpisodes,
                    lastEpisode: responseEpisodes[responseEpisodes.length - 1],
                    nextEpisode: null,
                }

                console.log(show.episodes);

                if ( this.media.id !== show.lastEpisode.id) {
                    show.episodes.forEach(episode => {
                        if ( this.media.id === episode.id-1 ) show.nextEpisode = episode;
                    });
                }

                return new Promise((resolve) => {
                    resolve(show);
                });
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async generateUUID() {
            if ( !this.$route.query.uuid ) {
                this.uuid = uuidv4();
            }
        },

        async saveTime(currentTime) {
            this.player.duration = this.player.el.duration();
            var showID = null;
            var watched = 0;
            if ( this.show ) showID = this.show.info.tmdbID;

            var nextMediaID = false;
            var nextCurrentSecond = false;
            var nextTotalDuration = false;
            var nextWatched = false;

            if ( currentTime === this.duration ) {
                watched = 1;

                // if ( document.getElementById('next-episode-btn') ) {
                //     const nextBtn = document.getElementById('next-episode-btn');

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
                    userID: this.$globalState.user.id,
                    mediaID: this.media.tmdbID,
                    nextMediaID: nextMediaID,
                    showID: showID,
                    currentTime: currentTime,
                    nextTime: nextCurrentSecond,
                    watched: watched,
                    nextWatched: nextWatched,
                    totalLength: this.player.duration,
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
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getMediaWatched?mediaID=${this.media.tmdbID}&userID=${this.$globalState.user.id}`);

                await this.setPlayerTime(response.data.watched_seconds, response.data.total_length);
                if ( response.data ) this.setPlayerTime(response.data.watched_seconds, response.data.total_length);

            } catch(err) {
                console.log(err);
            }
        },
        async saveUserVolume() {
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/saveUserVolume?userID=${this.$globalState.user.id}&volume=${this.$globalState.user.volume}`);
            } catch(err) {
                console.log(err);
            }
        },

        async setUpPlayer() {
            try {
                this.media = await this.getMedia(this.$route.query.id);

                if ( 'show_id' in this.media) {
                    this.show = await this.getShow(this.media.show_id);
                }

                this.$nextTick(async () => {
                    this.player.el = videojs('main-video', this.player.options);

                    this.player.el.ready(async () => {
                        console.log('ready');

                        if (!this.$route.query.uuid) await this.generateUUID();
                        
                        this.moveButtons();

                        await this.setPlayerStartTime();

                        this.player.el.on('durationchange', async () => {
                            if ( this.$globalState.user.volume === undefined ) this.$globalState.user.volume = 1;

                            await this.playerFunctions();
                            if ( this.$route.query.uuid ) await this.webSocket();
                        });
                    });
                });
            } catch(err) {
                console.log(err);
            }
        },

        async playerFunctions() {
            var playerEL = this.player.el;
            var player = this.player;

            playerEL.volume(this.$globalState.user.volume);

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
                this.$globalState.user.volume = playerEL.volume();
                this.saveUserVolume();
            });
        },
        toggleShowMenu(e) {
            e.preventDefault();
            document.getElementById('show-container').classList.toggle('visible');
        },
        openSeasonContainer(e, id) {
            e.preventDefault();
            const showContainer = document.getElementById('show-container');
            var seasonContainer = document.getElementById(id);

            showContainer.classList.add('active-submenu');
            seasonContainer.classList.add('active');
        },
        closeSeasonContainer(e) {
            e.preventDefault();
            const showContainer = document.getElementById('show-container');
            var openSeasonContainer = document.querySelector('.sub-menu.active');

            showContainer.classList.remove('active-submenu');
            openSeasonContainer.classList.remove('active');
        },
        async webSocket() {
            const host = window.location.hostname;
            var videoPlayer = document.getElementById('main-video');


            this.socket = new WebSocket(`ws://${host}:3000/?remotesessionID=${this.$route.query.uuid}`);

            let isFirstPlay = true;
            const messageWrap = document.getElementById('message-wrap');
            const msgInput = document.getElementById('message-input');
            const sendButton = document.getElementById('chatMSG');
            var delimiter = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

            this.socket.onopen = () => {
                var send = `joined§${this.$globalState.user.id}§${this.$globalState.user.username}§${this.$globalState.user.img}`;
                console.log(this.$globalState.user);
                joinedMessage(this.$globalState.user.id, this.$globalState.user.username, this.$globalState.user.img);
                this.socket.send(send);
            }

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            }

            this.socket.onmessage = (event) => {
                try {
                    if ( event.data.startsWith('[') ) {
                        const jsonData = JSON.parse(event.data);
                        if ( typeof jsonData === 'object' && jsonData !== null ) {
                            const cutter = jsonData[0];
                            const parts = jsonData[1].split(`${cutter}`);
                            const message = parts[1];
                            const userID = parts[2];
                            const username = parts[3];
                            const userImg = parts[4];
                            ajaxMessage(message, userID, username, userImg);
                        }
                    } else if ( event.data.startsWith('joined§') ) {
                        const userID = event.data.split('§')[1];
                        const username = event.data.split('§')[2];
                        const userImg = event.data.split('§')[3];
                        joinedMessage(userID, username, userImg);
                    } else if ( event.data === 'play' ) {
                        this.player.play();
                    } else if ( event.data === 'pause' ) {
                        this.player.el.pause();
                    } else if ( event.data.startsWith('timeupdate:') ) {
                        const newTime = parseFloat(event.data.split(':')[1]);
                        this.player.el.currentTime(newTime);
                    } else if ( event.data.startsWith('url:') ) {
                        const url = event.data.split(':')[1];
                        window.location.href = url;
                    }
                } catch (error) {
                    console.log(error);
                }                            
            }

            this.player.el.on('play', () => {
                // Sende Aktion "Play" an den Server
                if ( isFirstPlay ) {
                    this.player.el.pause();
                } else {
                    synchTime(this.player.el);
                    this.socket.send('play');
                }
            });
    
            this.player.el.on('pause', () => {
                if ( !isFirstPlay ) {
                    // Sende Aktion "Pause" an den Server
                    synchTime();
                    this.socket.send('pause');
                } else {
                    isFirstPlay = false;
                }
            });
    
            this.player.el.on('seeking', () => {
                if ( videoPlayer.classList.contains('vjs-scrubbing') ) {
                    synchTime();
                }            
            });

            const timeForwardsBtn = document.getElementsByClassName('vjs-skip-forward-10');
            timeForwardsBtn[0].addEventListener('click', () => {
                synchTime();
            });

            const timeBackwardsBtn = document.getElementsByClassName('vjs-skip-backward-10');
            timeBackwardsBtn[0].addEventListener('click', () => {
                synchTime();
            });

            function synchTime() {
                const currentTime = this.player.el.currentTime();
                const actionTimeUpdate = `timeupdate:${currentTime}`;
                this.socket.send(actionTimeUpdate);
            }

            function joinedMessage(userID, username, userImg) {
                var message = `
                <div class="message joint-msg marg-bottom-xs" data-user="${userID}">
                    <span class="imgWrap">
                        <figure class="square">
                            <img src="${userImg}">
                        </figure>
                    </span>
                    <div class="message-content-wrap">
                        <span class="message-text marg-left-xs small"><strong>${username}</strong> joined</span>
                    </div>
                </div>`;

                messageWrap.insertAdjacentHTML('beforeend', message);
                messageWrap.scrollTop = messageWrap.scrollHeight;
            }

            var ajaxMessage = (ajaxMessage, ajaxUserID, ajaxUsername, ajaxUserImg) => {
                var message = '';
                if ( ajaxUserID === this.$globalState.user.id ) {
                    message = `
                    <div class="message self marg-bottom-xs">
                        <div class="message-content-wrap">
                            <p class="message-username marg-bottom-no strong">${ajaxUsername}</p>
                            <p class="message-text small marg-bottom-no">${ajaxMessage}</p>
                        </div>
                        <span class="imgWrap marg-left-xs">
                            <figure class="square">
                                <img src="${ajaxUserImg}">
                            </figure>
                        </span>
                    </div>`;
                } else {
                    message = `
                    <div class="message marg-bottom-xs">
                        <span class="imgWrap marg-right-xs">
                            <figure class="square">
                                <img src="${ajaxUserImg}">
                            </figure>
                        </span>
                        <div class="message-content-wrap">
                            <p class="message-username marg-bottom-no strong">${ajaxUsername}</p>
                            <p class="message-text small marg-bottom-no">${ajaxMessage}</p>
                        </div>
                    </div>`;
                }

                messageWrap.insertAdjacentHTML('beforeend', message);
                messageWrap.scrollTop = messageWrap.scrollHeight;
            }

            
            
            msgInput.addEventListener('keyup', async (event) => {
                if (event.key === 'Enter') {
                    var send = [];
                    send[0] = `${delimiter}`;
                    send[1] = `msg${delimiter}${this.userMessage}${delimiter}${this.$globalState.user.id}${delimiter}${this.$globalState.user.username}${delimiter}${this.$globalState.user.img}`;
                    send = JSON.stringify(send);

                    if ( this.userMessage.length > 0) {
                        this.socket.send(send);
                        ajaxMessage(this.userMessage, this.$globalState.user.id, this.$globalState.user.username, this.$globalState.user.img, this.$globalState.user.id);
                        this.userMessage = "";
                    }
                }
            });

            sendButton.addEventListener('click', async () => {
                var send = [];
                send[0] = `${delimiter}`;
                send[1] = `msg${delimiter}${this.userMessage}${delimiter}${this.$globalState.user.id}${delimiter}${this.$globalState.user.username}${delimiter}${this.$globalState.user.img}`;
                send = JSON.stringify(send);

                if ( this.userMessage.length > 0) {
                    this.socket.send(send);
                    ajaxMessage(this.userMessage, this.$globalState.user.id, this.$globalState.user.username, this.$globalState.user.img, this.$globalState.user.id);
                    this.userMessage = "";
                }   
            });
        },
        moveButtons() {
            const player = document.getElementById('main-video');
            var backButton = document.getElementById('player-back-btn');
            player.appendChild(backButton);

            if ( document.getElementById('player-session-btn') ) {
                var sessionBtn = document.getElementById('player-session-btn');
                player.appendChild(sessionBtn);
            } else {
                var chatBtn = document.getElementById('chat-open');
                player.appendChild(chatBtn);
            }
        },
        toggleChat() {
            document.getElementById('chat').classList.toggle('hidden');
        }
    },
    watch: {
        '$route'(to, from) {
            if (to.query.id !== from.query.id && (to.query.uuid || !to.query.uuid)) {
                this.setUpPlayer(this.$route.query.id);
            }

            this.lastPath = (this.$router.options.history.state.back && !this.$router.options.history.state.back.includes('/watch') ? this.$router.options.history.state.back : this.lastPath);
            this.multiWatch = (this.$route.query.uuid ? true : false);
        }
    },
    async mounted() {
        this.lastPath = (this.$router.options.history.state.back && !this.$router.options.history.state.back.includes('/watch') ? this.$router.options.history.state.back : this.lastPath);
        this.multiWatch = (this.$route.query.uuid ? true : false);

        await this.setUpPlayer();        
    },
    beforeUnmount() {
        if (this.player.el) {
            this.player.el.dispose();
        }
    }
};
</script>

<style>
#app {

}
</style>
