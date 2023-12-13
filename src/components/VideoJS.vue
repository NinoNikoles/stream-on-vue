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
            player: null
        }
    },
    methods: {
        moveButtons(playerID) {
            var player = document.getElementById(playerID)

            if ( document.getElementById('player-session-btn') ) {
                var sessionBtn = document.getElementById('player-session-btn');
                player.appendChild(sessionBtn);
            } else {
                var chatBtn = document.getElementById('chat-open');
                player.appendChild(chatBtn);
            }
        }
    },
    mounted() {
        this.player = videojs(this.$refs.videoPlayer, this.options, () => {
            //this.player.log('onPlayerReady', this);

            if ( this.$route.query.t ) {
                var startTime = parseInt(this.$route.query.t);
                this.player.currentTime(startTime);
            }

            this.moveButtons(this.player.id_);
        });
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }
  }
</script>