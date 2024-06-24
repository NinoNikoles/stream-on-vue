<template>
    <div class="innerWrap">
        <div class="col12">
            <p><button id="theme-switch" class="btn" @click="themeChange($event)">Change</button></p>
            <input type="file" class="btn btn-primary hollow" @change="onImgSelect($event)" placeholder="Select img" style="width: auto;">
        </div>

        <div class="col6 marg-right-col1">
        
            <figure class="square">
                <img v-if="selectedImg" id="image" class="cropper-img" :src="selectedImg" style="transition: unset !important;">
            </figure>
            
            <button class="btn icon-only icon-add" @click="cropperZoom(0.1)"></button>
            <button class="btn icon-only icon-minus" @click="cropperZoom(-0.1)"></button>
            <button class="btn icon-only icon-save" @click="crop()"></button>
        </div>

        <div class="col5">
            <div v-if="selectedImg" class="" id="cropper-preview"><img id="image" class="cropper-img" :src="selectedImg" style="transition: unset !important;"></div>
        </div>
        <div class="col6">
            <h1>Lorem ipsum dolor sit amet.</h1>
            <h2>Lorem ipsum dolor sit amet.</h2>
            <h3>Lorem ipsum dolor sit amet.</h3>
            <h4>Lorem ipsum dolor sit amet.</h4>
            <h5>Lorem ipsum dolor sit amet.</h5>
            <h6>Lorem ipsum dolor sit amet.</h6>
        </div>

        <div class="col6">
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste, aut eos. Aperiam quis aliquam nobis deleniti ullam vero mollitia ut libero pariatur dolores veniam quia, beatae dolore quo dignissimos alias aut! Odit in amet recusandae tenetur quidem unde, et velit quo inventore sequi eum nemo repellat cum molestias sit fuga!</p>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem sint magnam vitae officia, quaerat nisi ex quod fugiat fuga modi rerum unde impedit provident neque. Vero ea, numquam ex optio provident, eveniet quae harum ullam sunt magni nihil ipsa eligendi unde veniam error, itaque dolores eaque voluptate et placeat cum.</p>
        </div>

        <div class="col6">
            <div class="col4"><button class="btn btn-primray">Primary</button></div>
            <div class="col4"><button class="btn btn-secondary">Secondary</button></div>
            <div class="col4"><button class="btn btn-tertiary">Tertiary</button></div>
            <div class="col4"><button class="btn btn-quaternary">Quaternary</button></div>
            <div class="col4"><button class="btn btn-quinary">Quinary</button></div>
        </div>

        <div class="col12">
            <form class="row">
                <div class="col2 column field-wrap">
                    <p>
                        <span class="input-wrap input-select">
                            <label for="anrede">Anrede</label>
                            <select id="anrede" name="anrede">
                                <option>Frau</option>
                                <option>Herr</option>
                                <option>Divers</option>
                            </select>
                        </span>
                    </p>
                </div>
                <div class="col5 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="vorname">Vorname</label>
                            <input type="text" id="vorname" name="vorname">
                        </span>
                    </p>
                </div>
                <div class="col5 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="nachname">Nachname</label>
                            <input type="text" id="nachname" name="nachname">
                        </span>
                    </p>
                </div>
                <div class="col4 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="email">E-Mail</label>
                            <input type="email" id="email" name="email">
                        </span>
                    </p>
                </div>
                <div class="col4 column  field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="tel">Telefon</label>
                            <input type="tel" id="tel" name="tel">
                        </span>
                    </p>
                </div>
                <div class="col12 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="message">Nachricht</label>
                            <textarea id="message" name="message"></textarea>
                        </span>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios';
// import 'cropperjs/dist/cropper.css';
import functions from './functions.vue';
import Cropper from 'cropperjs';

export default {
    name: 'AppTest',
    mixins: [functions, Cropper],
data() {
        return {
            highlight: null,
            availableGenre: null,
            availableSlider: null,
            availableSliderContent: null,
            url: window.location.protocol + '//' + window.location.hostname,
            allMedia: null,
            userWatchList: null,
            selectedImg: null,
            cropperObj: {
                el: null,
                currentZoom: 0.5,
                minZoom: 0.4,
                maxZoom: 0.9,
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
        async cropper() {
            const image = document.getElementById('image');

            const cropper = new Cropper(image, {
                viewMode: 1,
                initialAspectRatio: 1/1,
                aspectRatio: 1/1,
                restore: false,
                preview: document.getElementById('cropper-preview'),
                zoomOnWheel: false,
                responsive: true,
                movable: false,
            });

            this.cropperObj.el = cropper;
        },
        crop() {
            this.cropperObj.cropped = this.cropperObj.el.getCroppedCanvas().toDataURL();
            console.log(this.cropperObj.cropped);
            this.$globalState.user.img = this.cropperObj.cropped;

            var query = 'UPDATE users SET img = ? WHERE id = ?';
            var data = [
                this.$globalState.user.img,
                this.$globalState.user.id
            ]

            try {
                axios.post(`${this.$mainURL}:3000/api/db/postQuery`, { query, data });

            } catch(err) {
                console.log(err);
            }
        },
        async cropperZoom(zoom) {
            if (zoom > 0) {
                if (!(this.cropperObj.currentZoom <= this.cropperObj.maxZoom)) return;
                this.cropperObj.el.zoom(zoom);
                this.cropperObj.currentZoom = this.cropperObj.currentZoom+zoom;
            } else if (zoom < 0) {
                if (!(this.cropperObj.currentZoom >= this.cropperObj.minZoom)) return;
                this.cropperObj.el.zoom(zoom);
                this.cropperObj.currentZoom = this.cropperObj.currentZoom+zoom;
            }
            console.log(this.cropperObj.currentZoom);
        },
    },
    async mounted() {
        // await this.cropper();
    }
};
</script>