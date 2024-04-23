<template>
    <div class="innerWrap">
        <div class="col12">
            <p><button id="theme-switch" class="btn" @click="themeChange($event)">Change</button></p>
        </div>

        <div class="col6 marg-right-col6">
        

            <!-- <button class="btn" @click="bearbeiteJSON">JSON Bearbeiten</button> -->
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
// import axios from 'axios';
import 'cropperjs/dist/cropper.css';
import functions from './mixins/functions.vue';
import Cropper from 'cropperjs';
// import ImageLoader from './includes/ImageLoader.vue';

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
        async bearbeiteJSON() {
            // JSON Datei URL
            const jsonURL = '/media/test.json';
            const response = await fetch(jsonURL);
            console.log(response);
            try {
                // Daten laden
                

                if (response.ok) {
                    // JSON Daten parsen
                    const data = await response.json();
                    console.log(data.uploads);

                    // Neue Nummer generieren (die Länge des Arrays + 1)
                    const neueNummer = data.uploads.length + 1;

                    // Neuen Eintrag hinzufügen
                    data.uploads.push({ "id": neueNummer, "image": 'Beispiel' });
                    console.log(data);
                    // Daten speichern
                    await fetch(jsonURL, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                } else if (response.status === 404) {
                // JSON Datei existiert nicht, also erstellen
                const newData = {
                    eintraege: [{ nummer: 1, string: 'Beispiel' }]
                };

                // Daten speichern
                await fetch(jsonURL, {
                    method: 'PUT',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newData)
                });
                }
            } catch (error) {
                console.error('Fehler beim Bearbeiten der JSON-Datei:', error);
            }
        },
    },
};
</script>