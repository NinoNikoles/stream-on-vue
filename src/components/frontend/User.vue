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
                            <img :src="$globalState.user.img"  id="image" title="">
                            <span class="text-center text-small">
                                <i class="icon-only icon-image marg-no"></i>
                                <br>
                                <span class="marg-no">{{ langSnippet('select_image') }}</span>
                            </span>
                            <input type="file" accept="image/png, image/jpeg, image/jpg" @change="onImgSelect">
                        </figure>
                    </div>

                    <div class="col12" v-if="selectedImg">
                        <figure class="square cropper">
                            <img :src="selectedImg" id="image" title="">
                        </figure>

                        <p class="text-center marg-top-xxs">
                            <span class="marg-right-xxs">
                                <button class="btn btn-primary icon-only icon-zoom-in" @click="cropperZoom(0.1)"></button>
                            </span>

                            <span class="marg-right-xxs">
                                <button class="btn btn-primary icon-only icon-zoom-out" @click="cropperZoom(-0.1)"></button>
                            </span>

                            <span class="marg-right-xxs">
                                <button class="btn btn-warning icon-only icon-replay" @click="cropperReset"></button>
                            </span>

                            <span class="marg-right-xxs">
                                <button class="btn btn-success icon-only icon-save loading" @click="crop($event)"></button>
                            </span>

                            <button class="btn btn-alert icon-only icon-close" @click="cropperDestroy"></button>
                        </p>
                    </div>
                </div>

                <div class="col6 pad-top-xs">
                    <h1>{{ $globalState.user.username }}</h1>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
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
            zoomVal: 0,
            prevZoomVal: 0,
            cropperObj: {
                el: null,
                currentZoom: 0.5,
                minZoom: 0,
                maxZoom: 1,
                cropped: null,
            }
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
                viewMode: 1,
                initialAspectRatio: 1/1,
                aspectRatio: 1/1,
                autoCropArea: 1,
                restore: false,
                // preview: document.getElementById('cropper-preview'),
                zoomOnWheel: false,
                responsive: true,
                movable: false,
            });

            this.cropperObj.el = cropper;
        },
        cropperZoom(zoom) {
            if (zoom > 0) {
                if (!(this.cropperObj.currentZoom <= this.cropperObj.maxZoom)) return;
                this.cropperObj.el.zoom(zoom);
                this.cropperObj.currentZoom = this.cropperObj.currentZoom+zoom;
            } else if (zoom < 0) {
                if (!(this.cropperObj.currentZoom >= this.cropperObj.minZoom)) return;
                this.cropperObj.el.zoom(zoom);
                this.cropperObj.currentZoom = this.cropperObj.currentZoom+zoom;
            }
        },
        cropperReset() {
            this.cropperObj.currentZoom = 0.5;
            this.cropperObj.el.reset();
        },
        cropperDestroy() {
            this.file = null;
            this.croppedImg = null;
            this.selectedImg = null;
            this.cropperObj.currentZoom = 0.5;
            this.cropperObj.el.destroy();
        },
        async crop(e) {
            const saveButton = e.target;
            await this.disableButton(saveButton);

            this.cropperObj.cropped = this.cropperObj.el.getCroppedCanvas().toDataURL();

            this.$globalState.user.img = this.cropperObj.cropped;

            var query = 'UPDATE users SET img = ? WHERE id = ?';
            var data = [
                this.$globalState.user.img,
                this.$globalState.user.id
            ]

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/postQuery`, { query, data });
                this.cropperObj.el.destroy();
                this.cropperObj.currentZoom = 0.5;
                this.file = null;
                this.croppedImg = null;
                this.selectedImg = null;

                this.callout('success', this.langSnippet('saved'));
                this.enableButton(saveButton);
            } catch(err) {
                console.log(err);
            }
        },
    },
    async mounted() {
        if ( this.$globalState.user.username !== this.$route.params.username ) {
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
