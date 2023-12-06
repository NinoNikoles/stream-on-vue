<template>
    <div class="innerWrap">
        <div class="col12">
            <div class="col12" v-if="!userDBcheck"></div>

            <div class="col12" v-if="userDBcheck === false">
                <h1>Keine Berechtigung</h1>
                <router-link to="/" class="btn btn-large btn-white icon-left icon-arrow-left">Zurück</router-link>
            </div>

            <div class="col8 marg-left-col2" v-else>
                <div class="col5 marg-right-col1">
                    <figure class="square">
                        <img :data-img="`${this.currentUser.activeImg}`" id="user-img" loading="lazy" alt="">
                    </figure>                
                </div>

                <div class="col6 pad-top-xs">
                    <h1>{{ currentUser.username }}</h1>

                    <form @submit.prevent="uploadFiles(uploadIMG)">
                        <input type="number" name="id" value="<?php echo $_GET['id']; ?>" style="display:none;">
                        <p>
                            <label for="user-img">{{ langSnippet('upload_new_img') }}
                                <input type="file" id="imgUpload" @change="handleFileUpload" accept="image/*">
                            </label>
                        </p>
                        <p class="text-right">
                            <button id="userImgUpload" type="submit" class="btn btn-small btn-success loading" name="submit" value="Hochladen">Hochladen</button>
                        </p>
                    </form>
                </div>
            </div>

            <div v-if="currentUser.images.length > 0" id="uploads" class="col8 marg-top-xl marg-bottom-xl marg-left-col2">
                <div class="col6">
                    <h2 class="h3">{{ langSnippet('all_uploads') }}</h2>
                </div>

                <div class="col6 text-right">
                    <a v-if="selectedImg !== currentUser.activeImg" @click="updateUserIMG(selectedImg)" href="#" class="btn btn-small btn-success icon-left icon-save loading marg-right-xxs" id="updateUserImg">{{ langSnippet('save') }}</a>
                    <a href="#delete-user-image" class="btn btn-small btn-alert icon-left icon-trash loading" data-fancybox>{{ langSnippet('delete') }}</a>
                </div>

                <div class="col12">
                    <div class="col12 grid-row" id="allUserUploads">
                        <div v-for="(image, index) in currentUser.images" :key="index" class="col-6 col-3-xsmall col-2-medium grid-padding marg-bottom-base select-item">
                            <div class="user-img-select">
                                <input v-if="`/${mediaPath}/${userUploadPath}/${currentUser.username}/${image.path}` === this.currentUser.activeImg" v-model="selectedImg" type="radio" name="userImg" :value="`${image.path}`" checked>
                                <input v-else type="radio" v-model="selectedImg" name="userImg" :value="`${image.path}`">
                                <figure class="square">
                                    <img :data-img="`/${mediaPath}/${userUploadPath}/${this.currentUser.username}/${image.path}`" loading="lazy" alt="">
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="delete-user-image" style="display:none;">
                    <p v-html="langSnippet('delete_img')"></p>
                    <p class="text-right marg-no">
                        <button type="submit" @click="deleteUploadedUserImg(selectedImg)" class="btn btn-small btn-alert icon-left icon-trash" :title="langSnippet('delete')">{{ langSnippet('delete') }}</button>
                    </p>
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
import { Fancybox } from '@fancyapps/ui';
//import { Fancybox } from "@fancyapps/ui";

export default {
    name: 'FrontendUser',
    mixins: [tmdbAPI,langSnippet, mainFunctions],
    data() {
        return {
            pageUserID: this.$route.params.id,
            userDBcheck: null,
            currentUser: {
                id: null,
                username: null,
                activeImg: null,
                images: [],
            },
            uploadIMG: null,
            mediaPath: 'media',
            userUploadPath: 'user_uploads',
            selectedImg: null
        };
    },
    methods: {
        async checkUserInDB() {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getUser?userID=${this.pageUserID}`);
                return response.data;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return [];
            }
        },
        async fetchSessionStatus() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                if ( response.data.user ) this.currentUser.id = response.data.user.id;             
            } catch (error) {
                console.error('Fehler beim Abrufen des Session-Status:', error);
            }
        },
        async getCurrentUserInfo() {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getUser?userID=${this.currentUser.id}`);
                this.currentUser.username = response.data[0].username;
                if ( response.data[0].user_img !== 'avatar' ) {
                    this.currentUser.activeImg = `/${this.mediaPath}/${this.userUploadPath}/${this.currentUser.username}/${response.data[0].user_img}`;
                } else {
                    this.currentUser.activeImg = `/${this.mediaPath}/${response.data[0].user_img}.webp`;
                }
                this.currentUser.uploads = JSON.parse(response.data[0].uploads);
                this.selectedImg = this.currentUser.activeImg;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return [];
            }
        },
        handleFileUpload(event) {
            this.uploadIMG = event.target.files;
            console.log(this.uploadIMG);
        },
        async uploadFiles(files) {
            // Annahme: Du verwendest z.B. axios, um die Dateien an den Server zu senden
            // Hier müsstest du die Logik für das Hochladen implementieren
            try {
                const username = this.currentUser.username; // Hier musst du die Benutzer-ID erhalten oder setzen

                // Erstelle einen Ordner für den Benutzer, wenn nicht vorhanden
                await this.createFolder(username);

                // Iteriere durch jede hochgeladene Datei und lade sie hoch
                for (const file of files) {
                    await this.uploadFile(username, file);
                }

                console.log('Dateien erfolgreich hochgeladen.');
            } catch (error) {
                console.error('Fehler beim Hochladen der Dateien:', error);
            }
        },
        async createFolder(userId) {
            // Hier implementierst du die Logik, um einen Ordner mit dem Benutzernamen zu erstellen
            // Dies könnte z.B. ein API-Aufruf an den Server sein, um den Ordner zu erstellen
            console.log('Ordner für Benutzer erstellt:', userId);
        },
        async uploadFile(username, file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('username', username);

                await axios.post(`${this.$mainURL}:3000/userIMGUpload?username=${username}`, formData, {
                    headers: {
                        'Conent-Type': 'multipart/form-data',
                    }
                }).then(() => {
                    document.getElementById('imgUpload').value = "";
                    this.updateUserIMG(file.name).then(() => {
                        this.getUploads();
                    });
                });
            } catch (error) {
                console.error('Fehler beim Hochladen der Datei:', error);
            }
        },
        async updateUserIMG(imgName) {
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/updateUserImg?userID=${this.currentUser.id}&img=${imgName}`).then(() => {
                    if ( imgName !== 'avatar' ) {
                        this.currentUser.activeImg = `/${this.mediaPath}/${this.userUploadPath}/${this.currentUser.username}/${imgName}`;
                        this.selectedImg = this.currentUser.activeImg;
                        document.getElementById('userIcon').src = `/${this.mediaPath}/${this.userUploadPath}/${this.currentUser.username}/${imgName}`;
                    } else {
                        this.currentUser.activeImg = `/${this.mediaPath}/${imgName}.webp`;
                        this.selectedImg = this.currentUser.activeImg;
                        document.getElementById('userIcon').src = `/${this.mediaPath}/${imgName}.webp`;
                    }
                    
                });
            } catch (error) {
                console.error('Fehler beim Hochladen der Datei:', error);
            }
        },
        async getUploads() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getUploadedUserImages?username=${this.currentUser.username}`);
                this.currentUser.images = response.data;
            } catch (err) {
                console.log(err);
            }
        },
        async deleteUploadedUserImg() {
            var img = this.selectedImg.split('/');
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/deleteUploadedUserImage?img=${img[4]}&username=${this.currentUser.username}`)
                .then(() => {
                    if ( this.selectedImg === this.currentUser.activeImg ) {
                        this.updateUserIMG('avatar').then(() => {
                            this.getUploads();
                        });
                    } else {
                        this.getUploads();
                    }

                    this.selectedImg = this.currentUser.activeImg;
                    Fancybox.close();
                });
            } catch (err) {
                console.log(err);
            }
        }
    },
    mounted() {
        this.checkUserInDB().then(checkedUser => {
            this.fetchSessionStatus().then(() => {
                if ( checkedUser.length === 0 || this.currentUser.id !== checkedUser[0].id) {
                    this.userDBcheck = false;
                    return;
                }
                this.userDBcheck = true;

                this.getCurrentUserInfo().then(() => {
                    this.getUploads();
                });
            });
        });      
    }
};
</script>

<style>
#app {

}
</style>
