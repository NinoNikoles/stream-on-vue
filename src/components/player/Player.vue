<template>
    <div id="mainPlayer" class="mainPlayer fullscreen" v-if="media">
        <figure>
            <video class="video-js" id="main-video">
                <source :src="src">
            </video>

            <router-link id="player-back-btn" :to="lastPath" title=""></router-link>
            <a id="player-session-btn" :href="`/w?id=${$route.query.id}&uuid=${uuid}`" title="Group session" v-if="uuid && !$route.query.uuid"></a>
            
            <!-- Chat button -->
            <button id="chat-open" @click="toggleChat($event)" v-show="multiWatch"></button>

            <!-- Next episode button -->
            <a :href="`/w?id=${show.nextEpisode.tmdbID}&uuid=${$route.query.uuid}`" v-if="show.nextEpisode && $route.query.uuid" id="next-episode-btn" class="next-episode-btn">
                <figure class="widescreen">
                    <img :src="$loadImg(show.nextEpisode.backdrop)">
                    <i class="icon icon-play"></i>
                </figure>
                <span>{{ langSnippet('next_episode') }}</span>
            </a>
            <a :href="`/w?id=${show.nextEpisode.tmdbID}`" v-else-if="show.nextEpisode && !$route.query.uuid" id="next-episode-btn" class="next-episode-btn">
                <figure class="widescreen">
                    <img :src="$loadImg(show.nextEpisode.backdrop)">
                    <i class="icon icon-play"></i>
                </figure>
                <span>{{ langSnippet('next_episode') }}</span>
            </a>

            <!-- All episodes button -->
            <button href="#" id="show-eps-btn" @click="toggleShowMenu($event)" class="icon icon-multilayer" title="All episodes" v-if="show.episodes"></button>

            <!-- All episodes popup  -->
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

        <!-- Chat -->
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
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
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
                return  document.getElementById('main-video')
            });
        },
        async getMedia(tmdbID) {
            if ( tmdbID ) {
                let response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);
                if (response.data.length === 0) {
                    response = await axios.get(`${this.$mainURL}:3000/api/db/episode?tmdbID=${tmdbID}`);
                }

                this.src = `/${response.data[0].file_path.replace('/public/', '')}`;

                return new Promise((resolve) => {
                    resolve(response.data[0]);
                });      
            }
        },
        async getShow(showID) {
            try {
                const [responseShow, responseSeasons, responseEpisodes] = await Promise.all([
                    this.get(`SELECT * FROM media WHERE tmdbID = ${showID}`),
                    this.get(`SELECT * FROM seasons WHERE show_tmdbID = ${showID}`),
                    this.get(`SELECT * FROM episodes WHERE show_id = ${showID}`)
                ]);

                const show = {
                    info: responseShow[0],
                    seasons: responseSeasons,
                    episodes: responseEpisodes,
                    lastEpisode: responseEpisodes[responseEpisodes.length - 1],
                    nextEpisode: null,
                };

                if ( this.media.id !== show.lastEpisode.id) {
                    show.episodes.forEach(episode => {
                        if ( this.media.id === episode.id-1 && episode.file_path ) show.nextEpisode = episode;
                    });
                }

                return new Promise((resolve) => {
                    resolve(show);
                });
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return [];
            }
        },
        async generateUUID() {
            if ( !this.$route.query.uuid ) {
                this.uuid = uuidv4();
            }
        },
        async saveTime(currentTime) {
            this.player.duration = this.player.el.duration();
            const showID = this.show.info ? this.show.info.tmdbID : null;
            const watched = currentTime === this.player.duration ? 1 : 0;
            var mediaID = this.media.tmdbID;
            var tvime = currentTime;
            var vlength = this.player.duration;

            if ( currentTime >= this.player.duration-20 ) {
                if ( this.show.nextEpisode ) {
                    mediaID = this.show.nextEpisode.tmdbID;
                    tvime = 0.000001;
                    vlength = 100;
                }
            }

            console.log(mediaID);
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/safeWatchTime`, {
                    userID: this.$globalState.user.id,
                    mediaID: mediaID,
                    showID: showID,
                    currentTime: tvime,
                    watched: watched,
                    totalLength: vlength
                });
            } catch (err) {
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
                this.setPlayerTime(response.data.watched_seconds, response.data.total_length);
            } catch (err) {
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
                        await this.playerFunctions();

                        if ( this.$route.query.uuid ) await this.webSocket();
                    });
                });
            } catch(err) {
                console.log(err);
            }
        },

        async playerFunctions() {
            var playerEL = this.player.el;
            var nextEpisodeBtn = document.getElementById('next-episode-btn');

            // Set Volume of player
            playerEL.volume(this.$globalState.user.volume);

            // Get total duration of video
            this.player.duration = playerEL.duration();

            // Set player current time
            if ( this.player.currentTime === this.player.duration ) this.player.currentTime = 0;
            playerEL.currentTime(this.player.currentTime);

            var interval = false;
            const saveInterval = () => {
                clearInterval(interval);
                interval = setInterval(() => this.saveTime(playerEL.currentTime()), 30000);
            };

            // On video playing
            playerEL.on('play', () => {
                this.isVideoEnded = false;
                saveInterval();
                this.saveTime(playerEL.currentTime());
            });

            // On video seeking
            playerEL.on('seeking', () => {
                if ( document.getElementById('main-video').classList.contains('vjs-scrubbing') ) {
                    saveInterval();
                    this.saveTime(playerEL.currentTime());
                }
            });

            // On video ended
            playerEL.on('ended', () => {
                this.isVideoEnded = true;
                saveInterval();
                this.saveTime(playerEL.currentTime());
            });

            // On video pause
            playerEL.on('pause', () => {
                clearInterval(interval);
                if ( playerEL.currentTime() !== this.player.duration) {
                    this.saveTime(playerEL.currentTime());
                } else {
                    this.isVideoEnded = true;
                    this.saveTime(this.player.duration);
                }
            });

            // On video volume change
            playerEL.on('volumechange', () => {
                this.$globalState.user.volume = playerEL.volume();
                this.saveUserVolume();
            });

            // On video time update
            playerEL.on('timeupdate', () => {
                if ( nextEpisodeBtn ) {
                    if (playerEL.currentTime() >= playerEL.duration()-20) {
                        if ( !nextEpisodeBtn.classList.contains('visible') ) {
                            nextEpisodeBtn.classList.add('visible');
                        }
                    } else {
                        if ( nextEpisodeBtn.classList.contains('visible') ) {
                            nextEpisodeBtn.classList.remove('visible');
                        }
                    }
                }
            });

            if ( nextEpisodeBtn ) {
                nextEpisodeBtn.addEventListener('click', (e) =>{
                    e.preventDefault();

                    const nextEpisodeLink = nextEpisodeBtn.getAttribute('href');
                    if (this.socket) this.socket.send(`url:${nextEpisodeLink}`);
                    window.location = nextEpisodeLink;
                });
            }
        },
        toggleShowMenu(e) {
            e.preventDefault();
            document.getElementById('show-container').classList.toggle('visible');
        },
        openSeasonContainer(e, id) {
            e.preventDefault();
            const showContainer = document.getElementById('show-container');
            const seasonContainer = document.getElementById(id);

            showContainer.classList.add('active-submenu');
            seasonContainer.classList.add('active');
        },
        closeSeasonContainer(e) {
            e.preventDefault();
            const showContainer = document.getElementById('show-container');
            const openSeasonContainer = document.querySelector('.sub-menu.active');

            showContainer.classList.remove('active-submenu');
            openSeasonContainer.classList.remove('active');
        },
        async webSocket() {
            const host = window.location.hostname;
            const videoPlayer = document.getElementById('main-video');
            const messageWrap = document.getElementById('message-wrap');
            const msgInput = document.getElementById('message-input');
            const sendButton = document.getElementById('chatMSG');

            this.socket = new WebSocket(`ws://${host}:3000/?remotesessionID=${this.$route.query.uuid}`);

            this.socket.onopen = () => {
                const send = `joined§${this.$globalState.user.username}§${this.$globalState.user.img}`;
                this.socket.send(send);
                joinedMessage(this.$globalState.user.username, this.$globalState.user.img);
            }

            this.socket.onerror = (error) =>  console.error('WebSocket error:', error);

            this.socket.onmessage = (event) => {
                try {
                    if ( event.data.startsWith('msg:') ) {
                        const jsonData = JSON.parse(event.data.replace('msg:', ''));

                        if ( typeof jsonData === 'object' && jsonData !== null ) {
                            const message = jsonData[0];
                            const username = jsonData[1];
                            const userImg = jsonData[2];
                            ajaxMessage(message, username, userImg);
                        }
                    } else if ( event.data.startsWith('joined§') ) {
                        const [username, userImg] = event.data.split('§').slice(1);
                        joinedMessage(username, userImg);
                    } else if ( event.data === 'play' ) {
                        this.player.play();
                    } else if ( event.data === 'pause' ) {
                        this.player.el.pause();
                    } else if ( event.data.startsWith('timeupdate:') ) {
                        const currentTime = parseFloat(event.data.replace('timeupdate:', ''));
                        this.player.el.currentTime(currentTime);
                    } else if ( event.data.startsWith('url:') ) {
                        const url = event.data.split(':')[1];
                        window.location.href = url;
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            this.socket.onclose = () => {
                console.log('WebSocket closed');
                clearInterval();
                this.socket.close();
            };

            const ajaxMessage = (msg, username, userImg) => {
                if (userImg === '-1') userImg = '/media/avatar.webp';
                const message = document.createElement('div');
                message.classList.add('message', 'marg-bottom-xs', username === this.$globalState.user.username ? 'self' : 'remote');
                message.innerHTML = `
                    <div class="message-content-wrap">
                        <p class="message-username marg-bottom-no strong">${username}</p>
                        <p class="message-text small marg-bottom-no">${msg}</p>
                    </div>
                    <span class="imgWrap">
                        <figure class="square">
                            <img src="${userImg}">
                        </figure>
                    </span>
                    <p class="message-timestamp smaller marg-bottom-no">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                `;
                messageWrap.appendChild(message);
                message.scrollIntoView({ behavior: 'smooth' });
            };

            const joinedMessage = (username, userImg) => {
                if (userImg === '-1') userImg = '/media/avatar.webp';
                const message = document.createElement('div');
                message.classList.add('message', 'joint-msg', 'marg-bottom-xs', 'joined');
                message.innerHTML = `
                    <span class="imgWrap">
                        <figure class="square">
                            <img src="${userImg}">
                        </figure>
                    </span>
                    <div class="message-content-wrap">
                        <span class="message-text marg-left-xs small">
                            <strong>${username}</strong> joined
                        </span>
                    </div>
                `;
                messageWrap.appendChild(message);
                message.scrollIntoView({ behavior: 'smooth' });
            };

            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (msgInput.value.trim() !== '') {
                    const msg = msgInput.value.trim();
                    const message = `msg:${JSON.stringify([msg, this.$globalState.user.username, this.$globalState.user.img])}`;
                    this.socket.send(message);
                    ajaxMessage(msg, this.$globalState.user.username, this.$globalState.user.img);
                    msgInput.value = '';
                }
            });

            videoPlayer.addEventListener('play', () => {
                this.socket.send('play');
            });

            videoPlayer.addEventListener('pause', () => {
                if (!this.isVideoEnded) this.socket.send('pause');
            });

            videoPlayer.addEventListener('timeupdate', () => {
                if (!this.isVideoEnded) this.socket.send(`timeupdate:${videoPlayer.currentTime}`);
            });

            msgInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendButton.click();
                }
            });
        },
        moveButtons() {
            const btnContainer = document.querySelector('.vjs-control-bar');
            const btnWrapper = document.createElement('div');
            const backButton = document.getElementById('player-back-btn');
            const sessionBtn = document.getElementById('player-session-btn');
            const chatBtn = document.getElementById('chat-open');
            const rewind = document.querySelector('.vjs-rewind-button');
            const forward = document.querySelector('.vjs-forward-button');
            const episodeSelect = document.getElementById('show-eps-btn');

            btnWrapper.classList.add('vjs-custom-buttons');
            if (backButton) btnWrapper.appendChild(backButton);
            if (sessionBtn) btnWrapper.appendChild(sessionBtn);
            if (chatBtn) btnWrapper.appendChild(chatBtn);
            if (rewind) btnWrapper.appendChild(rewind);
            if (forward) btnWrapper.appendChild(forward);
            if (episodeSelect) btnWrapper.appendChild(episodeSelect);
            btnContainer.insertBefore(btnWrapper, btnContainer.firstChild);
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
    async created() {
        this.lastPath = (this.$router.options.history.state.back && !this.$router.options.history.state.back.includes('/watch') ? this.$router.options.history.state.back : this.lastPath);
        this.multiWatch = (this.$route.query.uuid ? true : false);

        await this.setUpPlayer();
    },
    beforeUnmount() {
        if (this.socket) this.socket.close();
        if (this.player.el) {
            this.saveTime(this.player.el.currentTime());
            this.player.el.dispose();
        }
    }
};
</script>

<style>
#app {

}
</style>