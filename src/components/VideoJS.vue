<template>
    <video ref="videoPlayer" class="video-js" id="video-js"></video>
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
        
    },
    mounted() {
        this.player = videojs('video-js', this.options, () => {
            this.player.ready(() => {
                this.moveButtons(this.player.id_);
            });
        });

        console.log(this.player);
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }
}
</script>