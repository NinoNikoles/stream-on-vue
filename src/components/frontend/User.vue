<template>
    <div class="innerWrap pad-top-xl">
        <div class="col12">
            <div class="col12" v-if="!userDBcheck"></div>

            <div class="col12" v-if="userDBcheck === false">
                <h1>Keine Berechtigung</h1>
                <router-link to="/" class="btn btn-large btn-white icon-left icon-arrow-left">Zurück</router-link>
            </div>

            <div class="col8 marg-left-col2" v-else>
                <div class="col5 marg-right-col1">
                    <div class="col12" v-if="!selectedImg">
                        <figure class="square userImgContainer">
                            <img :src="`${$user.img}`"  id="image" title="">
                            <span class="text-center"><i class="icon-only icon-image marg-no"></i><br><span class="marg-no">Select Img</span></span>
                            <input type="file" @change="onImgSelect">
                        </figure>
                    </div>

                    <div class="col12" v-if="selectedImg">
                        <figure class="square cropper">
                            <img :src="selectedImg" id="image" title="">
                        </figure>
                        <input type="range" id="scale" name="scale" min="0" max="500" step="10" v-model="zoomVal" @input="cropperScale($event)"/>
                        <button 
                            class="btn icon-only icon-facebook" 
                            @click="cropperEl.reset(); zoomVal = 0"
                        ></button>
                    </div>
                </div>

                <div class="col6 pad-top-xs">
                    <h1>{{ $user.username }}</h1>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
// import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';
// import { Fancybox } from '@fancyapps/ui';

export default {
    name: 'FrontendUser',
    mixins: [tmdbAPI,langSnippet, mainFunctions, Cropper],
    data() {
        return {
            userDBcheck: null,
            file: null,
            selectedImg: null,
            croppedImg: null,
            cropperEl: null,
            zoomVal: 0,
            prevZoomVal: 0
        };
    },
    methods: {
        async onImgSelect(e) {
            const file = e.target.files[0];
            // Prüfe, ob ein Bild ausgewählt wurde
            if (file && file.type.includes('image')) {
                this.file = file;
                // Erstelle eine temporäre URL für das Bild
                this.selectedImg = URL.createObjectURL(file);

                this.$nextTick(() => {
                    this.cropper();
                });
            } else {
                this.file = null;
                this.imageUrl = null;
                // Gib eine Fehlermeldung aus, falls kein Bild ausgewählt wurde
                alert("Bitte wählen Sie ein Bild aus.");
            }
        },
        cropper() {
            const image = document.getElementById('image');

            const cropper = new Cropper(image, {
                viewMode: 0,
                initialAspectRatio: 1/1,
                aspectRatio: 1/1,
                autoCropArea: 5,
                zoomOnWheel: false,
                crop() {
                    // console.log(event.detail);
                    this.croppedImg = cropper.getCroppedCanvas().toDataURL();
                    // console.log(this.croppedImg);
                },
            });

            this.cropperEl = cropper;
        },
        cropperScale(slider) {
            const currentValue = parseInt(slider.target.value);
            var zoomValue = currentValue/100+1;
            this.cropperEl.scale(zoomValue);

            this.prevZoomVal = currentValue;
            this.zoomVal = currentValue;
        },
    },
    async mounted() {
        if ( this.$user.username !== this.$route.params.username ) {
            this.userDBcheck = false;
            return;
        }

        this.userDBcheck = true;
    }
};
</script>

<style>
#app {

}
</style>
