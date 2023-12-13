<template>
    <div id="mainPlayer" class="mainPlayer fullscreen" v-if="media">
        <figure>
            <video-player :options="videoOptions" v-if="videoOptions.sources[0].src !== ''"></video-player>
            <button id="chat-open" @click="toggleChat($event)"></button>
        </figure>

        <div id="chat">    
            <div class="chat-wrap grid-padding">
                <p id="chat-headline" class="text-center pad-top-xs pad-bottom-xs"><button id="chat-close" class="icon icon-close" @click="toggleChat($event)"></button>Chat</p>
                <div id="message-wrap">

                </div>
                <div id="input-wrap" class="pad-top-xs marg-top-xs marg-bottom-xs">
                    <label for="message-input" class="marg-right-xs">{{ langSnippet('message') }}
                        <input type="text" id="message-input" name="message-input" class="marg-no">
                    </label>
                    <input type="number" style="display:none;" id="message-use-id" name="message-use-id" :value="user.id">
                    <input type="text" style="display:none;" id="message-use-name" name="message-use-name" :value="user.username">
                    <button class="btn btn-small btn-white marg-no" id="chatMSG">{{ langSnippet('send') }}</button>
                </div>
            </div>
        </div>
        <!-- <span :data-time="`${watchedTime}`" :data-media="`${mediaID}`" :data-volume="`${volume}`" id="time"></span> -->
    </div>
</template>

<script>
import axios from 'axios';
import videojs from 'video.js';
import CryptoJS from 'crypto-js';
//import { Fancybox } from '@fancyapps/ui';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
import VideoPlayer from '../VideoJS.vue';

export default {
    name: 'MediaPlayer',
    mixins: [langSnippet, mainFunctions],
    components: {
        VideoPlayer
    },
    data() {
        return {
            mediaID: this.$route.query.id,
            uuid: this.$route.query.uuid,
            media: null,
            seasons: null,
            show: null,
            type: null,
            player: null,
            user: {
                id: null,
                username: null,
            },
            videoOptions: {
                controls: true,
                duration: true,
                preload: 'auto',
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
            }
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
                        this.videoOptions.sources[0].src = this.$mainURL+this.media.file_path;
                    } else {
                        const newResponse = await axios.get(`${this.$mainURL}:3000/api/db/episode?tmdbID=${tmdbID}`);
                        this.media = newResponse.data[0];
                        this.type = 'show';
                        this.videoOptions.sources[0].src = this.$mainURL+this.media.file_path;
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
        async definePlayer() {
            var playerClass = document.getElementsByClassName('video-js');
            this.player = videojs(playerClass[0].id);
        },
        async fetchSessionStatus() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                if ( response.data.user ) {
                    this.user.id = response.data.user.id;
                    this.user.username = response.data.user.name;
                }               
            } catch (error) {
                console.error('Fehler beim Abrufen des Session-Status:', error);
            }
        },
        async toggleChat(e) {
            e.preventDefault();
            const chat = document.getElementById('chat');
            chat.classList.toggle('hidden');
        },
        async getUserImg(userID) {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getUser?userID=${userID}`);
                var user = response.data[0];

                if ( user.user_img !== 'avatar' ) return `${this.$mainURL}/public/media/user_uploads/${user.username}/${user.user_img}`;
                return `${this.$mainURL}/public/media/${user.user_img}.webp`;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return [];
            }
        },
    },
    mounted() {
        this.getMedia(this.mediaID).then(() => {
            if ( this.type === 'show' ) {
                this.getShow(this.media.show_id);
            }
            
            this.definePlayer().then(() => {
                const host = window.location.hostname;

                // Ausführen, wenn die Metadaten geladen sind
                this.player.on("loadedmetadata", () => {
                    const socket = new WebSocket(`ws://${host}:3000/?remotesessionID=${this.uuid}`);
                    let isFirstPlay = true;
                    const messageWrap = document.getElementById('message-wrap');
                    const sendButton = document.getElementById('chatMSG');
                    var delimiter = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
                    const playerClass = document.getElementsByClassName('video-js');
                    const videoPlayer = document.getElementById(playerClass[0].id);

                    socket.onopen = () => {
                        this.fetchSessionStatus().then(async () => {
                            var userID = this.user.id;
                            var username = this.user.username;
                            var userImg = await this.getUserImg(userID);
                            
                            var send = `joined§${userID}§${username}§${userImg}`;
                            joinedMessage(userID, username, userImg);
                            socket.send(send);
                        });
                    }

                    socket.onerror = (error) => {
                        console.error('WebSocket error:', error);
                    }

                    socket.onmessage = (event) => {
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
                                console.log(userImg);
                                joinedMessage(userID, username, userImg);
                            } else if ( event.data === 'play' ) {
                                this.player.play();
                            } else if ( event.data === 'pause' ) {
                                this.player.pause();
                            } else if ( event.data.startsWith('timeupdate:') ) {
                                const newTime = parseFloat(event.data.split(':')[1]);
                                this.player.currentTime(newTime);
                            } else if ( event.data.startsWith('url:') ) {
                                const url = event.data.split(':')[1];
                                window.location.href = url;
                            }
                        } catch (error) {
                            console.log(error);
                        }                            
                    }

                    this.player.on('play', () => {
                        // Sende Aktion "Play" an den Server
                        if ( isFirstPlay ) {
                            this.player.pause();
                        } else {
                            synchTime(this.player);
                            socket.send('play');
                        }
                    });
            
                    this.player.on('pause', () => {
                        if ( !isFirstPlay ) {
                            // Sende Aktion "Pause" an den Server
                            synchTime(this.player);
                            socket.send('pause');
                        } else {
                            isFirstPlay = false;
                        }
                    });
            
                    this.player.on('seeking', () => {
                        if ( videoPlayer.classList.contains('vjs-scrubbing') ) {
                            synchTime(this.player);
                        }            
                    });

                    const timeForwardsBtn = document.getElementsByClassName('vjs-skip-forward-10');
                    timeForwardsBtn[0].addEventListener('click', () => {
                        synchTime(this.player);
                    });

                    const timeBackwardsBtn = document.getElementsByClassName('vjs-skip-backward-10');
                    timeBackwardsBtn[0].addEventListener('click', () => {
                        synchTime(this.player);
                    });

                    // const playTrigger = document.getElementsByClassName('play-trigger');
                    // playTrigger[0].addEventListener('click', function(e) {
                    //     e.preventDefault();
                    //     changeMedia(this);
                    // });

                    // const nextEpisodeBtn = document.getElementById('next-episode-btn');
                    // nextEpisodeBtn.addEventListener('click', function(e) {
                    //     e.preventDefault();
                    //     changeMedia(this);
                    // });

                    // function changeMedia(el) {
                    //     var url = el.getAttribute('href');
                    //     socket.send(`url:${url}`)
                    //     window.location.href = url;
                    // }

                    function synchTime(player) {
                        const currentTime = player.currentTime();
                        const actionTimeUpdate = `timeupdate:${currentTime}`;
                        socket.send(actionTimeUpdate);
                    }

                    const msgInput = document.getElementById('message-input');
                    
                    msgInput.addEventListener('keyup', async (event) => {
                        if (event.key === 'Enter') {
                            var userImg = await this.getUserImg(this.user.id);
                            sendMessage(this.user, userImg);
                        }
                    });

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

                    function ajaxMessage(ajaxMessage, ajaxUserID, ajaxUsername, ajaxUserImg, localUserID) {
                        var message = '';
                        if ( ajaxUserID === localUserID ) {
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

                    sendButton.addEventListener('click', async () => {
                        var userImg = await this.getUserImg(this.user.id);
                        sendMessage(this.user, userImg);
                    });

                    function sendMessage(user, userImg) {
                        var message = document.getElementById('message-input').value;
                        var send = [];
                        send[0] = `${delimiter}`;
                        send[1] = `msg${delimiter}${message}${delimiter}${user.id}${delimiter}${user.username}${delimiter}${userImg}`;
                        send = JSON.stringify(send);
                        document.getElementById('message-input').value = "";

                        if ( message.length > 0) {
                            socket.send(send);
                            ajaxMessage(message, user.id, user.username, userImg, user.id);
                        }   
                    }

                    // if ( remotesessionID ) {
                        

                    //     socket.onerror = (error) => {
                    //         console.error('WebSocket error:', error);
                    //     };

                    //     socket.onmessage = (event) => {
                    //         try {
                    //             if ( event.data.startsWith('[') ) {
                    //                 const jsonData = JSON.parse(event.data);
                    //                 if ( typeof jsonData === 'object' && jsonData !== null ) {
                    //                     const cutter = jsonData[0];
                    //                     const parts = jsonData[1].split(`${cutter}`);
                    //                     const message = parts[1];
                    //                     const userID = parts[2];
                    //                     const username = parts[3];
                    //                     ajaxMessage(message, userID, username);
                    //                 }
                    //             } else if ( event.data.startsWith('joined:') ) {
                    //                 const userID = event.data.split(':')[1];
                    //                 const username = event.data.split(':')[2];
                    //                 joinedMessage(userID, username);
                    //             } else if ( event.data === 'play' ) {
                    //                 videoPlayer.play();
                    //             } else if ( event.data === 'pause' ) {
                    //                 videoPlayer.pause();
                    //             } else if ( event.data.startsWith('timeupdate:') ) {
                    //                 const newTime = parseFloat(event.data.split(':')[1]);
                    //                 videoPlayer.currentTime(newTime);
                    //             } else if ( event.data.startsWith('url:') ) {
                    //                 const url = event.data.split(':')[1];
                    //                 window.location.href = url;
                    //             }
                    //         } catch (error) {
                                
                    //         }                            
                    //     };

                    //     videoPlayer.on('play', () => {
                    //         // Sende Aktion "Play" an den Server
                    //         if ( isFirstPlay ) {
                    //             videoPlayer.pause();
                    //         } else {
                    //             synchTime();
                    //             socket.send('play');
                    //         }
                    //     });
                
                    //     videoPlayer.on('pause', () => {
                    //         if ( !isFirstPlay ) {
                    //             // Sende Aktion "Pause" an den Server
                    //             synchTime();
                    //             socket.send('pause');
                    //         } else {
                    //             isFirstPlay = false;
                    //         }
                    //     });
                
                    //     videoPlayer.on('seeking', function () {
                    //         if ( videoPlayer.hasClass('vjs-scrubbing') ) {
                    //             synchTime();
                    //         }            
                    //     });
    
                    //     $('#player-sek-forward').on('click', function() {
                    //         synchTime();
                    //     });
    
                    //     $('#player-sek-back').on('click', function() {
                    //         synchTime();
                    //     });

                    //     $('.play-trigger').on('click', function(e) {
                    //         e.preventDefault();
                    //         changeMedia(this);
                    //     });

                    //     $('#next-episode-btn').on('click', function(e) {
                    //         e.preventDefault();
                    //         changeMedia(this);
                    //     });

                    //     function changeMedia($his) {
                    //         var url = $($his).attr('href');
                    //         socket.send(`url:${url}`)
                    //         window.location.href = url;
                    //     }

                    //     function synchTime() {
                    //         const currentTime = videoPlayer.currentTime();
                    //         const actionTimeUpdate = `timeupdate:${currentTime}`;
                    //         socket.send(actionTimeUpdate);
                    //     }

                    //     $msgInput = $('#message-input');
                        
                    //     $msgInput.on('keyup', function(event) {
                    //         if (event.key === 'Enter') {
                    //             sendMessage();
                    //         }
                    //     });

                    //     $('#chatMSG').on('click', function() {
                    //         sendMessage();                           
                    //     });

                    //     function sendMessage() {
                    //         var message = $('#message-input').val(),
                    //         userID = $('#message-use-id').val();
                    //         username = $('#message-use-name').val();
                    //         var send = [];
                    //         send[0] = `${delimiter}`;
                    //         send[1] = `msg${delimiter}${message}${delimiter}${userID}${delimiter}${username}`;
                    //         send = JSON.stringify(send);
                    //         $('#message-input').val("");

                    //         if ( message.length > 0) {
                    //             socket.send(send);
                    //             ajaxMessage(message, userID, username)
                    //         }   
                    //     }

                    //     function joinedMessage(userID, username) {
                    //         const joined = 'true';
                    //         console.log('test');
                    //         $.ajax({
                    //             url: '/msg',
                    //             type: 'post',
                    //             data: { 
                    //                 joined: joined,
                    //                 userID: userID,
                    //                 username: username,
                    //             },
                    //             success: function(response) {
                    //                 console.log(response);
                    //                 var newMessage = response;
                    //                 $('#message-wrap').append(newMessage);
                    //                 var objDiv = document.getElementById("message-wrap");
                    //                 objDiv.scrollTop = objDiv.scrollHeight;
                    //             }, error: function(xhr, status, error) {
                    //                 // Hier wird eine Fehlermeldung ausgegeben
                    //                 console.log('Fehler: ' + error);
                    //             }
                    //         });
                    //     }

                    //     function ajaxMessage(ajaxMessage, ajaxUserID, ajaxUsername) {
                    //         $.ajax({
                    //             url: '/msg',
                    //             type: 'post',
                    //             data: { 
                    //                 message: ajaxMessage,
                    //                 userID: ajaxUserID,
                    //                 username: ajaxUsername
                    //             },
                    //             success: function(response) {
                    //                 var newMessage = response;
                    //                 $('#message-wrap').append(newMessage);
                    //                 var objDiv = document.getElementById("message-wrap");
                    //                 objDiv.scrollTop = objDiv.scrollHeight;
                    //             }, error: function(xhr, status, error) {
                    //                 // Hier wird eine Fehlermeldung ausgegeben
                    //                 console.log('Fehler: ' + error);
                    //             }
                    //         });
                    //     }
                    // }
                });
            })
        });        
    }
};
</script>

<style>
#app {

}
body {
    padding-top: 0 !important;
}

#main {
    padding: 0 !important;
    height: unset !important;
    overflow: unset !important;
}
</style>
