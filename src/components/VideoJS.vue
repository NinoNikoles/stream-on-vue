<template>
    <video ref="videoPlayer" class="video-js"></video>
</template>
  
<script>
import videojs from 'video.js';
  
export default {
    name: 'VideoPlayer',
    props: {
        options: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            player: null,
            volume: 1,
            currentTime: 0,
        }
    },
    methods: {
        moveButtons(playerID) {
            var player = document.getElementById(playerID)
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
    },
    mounted() {
        this.player = videojs(this.$refs.videoPlayer, this.options, () => {
            this.player.ready(() => {
                this.moveButtons(this.player.id_);
            });
        });
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }
}
</script>