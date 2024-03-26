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
                    <figure class="square">
                        <img :src="`${$user.activeImg}`" id="user-img" loading="lazy" alt="">
                    </figure>                
                </div>

                <div class="col6 pad-top-xs">
                    <h1>{{ $user.username }}</h1>

                    <form @submit.prevent="uploadFiles(uploadIMG)">
                        <input type="number" name="id" value="<?php echo $_GET['id']; ?>" style="display:none;">
                        <p>
                            <label for="user-img">
                                <!-- <div class="input" data-type="file">{{ langSnippet('upload_new_img') }}</div> -->
                                <input type="file" id="imgUpload" @change="handleFileUpload" accept="image/*" placeholder="test">
                            </label>
                        </p>
                        <p class="text-right">
                            <button id="userImgUpload" type="submit" class="btn btn-small btn-success loading" name="submit" value="Hochladen">Hochladen</button>
                        </p>
                    </form>
                </div>
            </div>

            <div v-if="uploads" id="uploads" class="col8 marg-top-xl marg-bottom-xl marg-left-col2">
                <div class="col6">
                    <h2 class="h3">{{ langSnippet('all_uploads') }}</h2>
                </div>

                <div class="col6 text-right">
                    <a v-if="selectedImg !== $user.activeImg" @click="updateUserIMG(selectedImg)" href="#" class="btn btn-small btn-success icon-left icon-save loading marg-right-xxs" id="updateUserImg">{{ langSnippet('save') }}</a>
                    <button href="#delete-user-image" class="btn btn-small btn-alert icon-left icon-trash" data-fancybox>{{ langSnippet('delete') }}</button>
                </div>

                <div class="col12">
                    <div class="col12 grid-row" id="allUserUploads">
                        <div v-for="(image, index) in $user.uploads" :key="index" class="col-6 col-3-xsmall col-2-medium grid-padding marg-bottom-base select-item">
                            <div class="user-img-select">
                                <input v-if="`/${mediaPath}/${userUploadPath}/${$user.id}/${image.path}` === $user.activeImg" v-model="selectedImg" type="radio" name="userImg" :value="`${image.path}`" checked>
                                <input v-else type="radio" v-model="selectedImg" name="userImg" :value="`${image.path}`">
                                <figure class="square">
                                    <img :src="`/${mediaPath}/${userUploadPath}/${$user.id}/${image.path}`" loading="lazy" alt="">
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

export default {
    name: 'FrontendUser',
    mixins: [tmdbAPI,langSnippet, mainFunctions],
    data() {
        return {
            uploads: null,
            userDBcheck: null,
            uploadIMG: null,
            mediaPath: 'media',
            userUploadPath: 'user_uploads',
            selectedImg: null
        };
    },
    methods: {
        handleFileUpload(event) {
            this.uploadIMG = event.target.files;
        },
        async getUploads() {
            try {
                const response = await this.fetchDB(`getUploadedUserImages?userID=${this.$user.id}`);
                if ( response.data !== null && response.data !== undefined ) this.uploads = this.$user.uploads = response.data;
            } catch (err) {
                console.log(err);
            }
        },
        async uploadFiles(files) {
            try {
                const userID = this.$user.id;

                // Iteriere durch jede hochgeladene Datei und lade sie hoch
                for (const file of files) {
                    await this.uploadFile(userID, file);
                }
            } catch (error) {
                console.error('Fehler beim Hochladen der Dateien:', error);
            }
        },
        async uploadFile(userID, file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userID', userID);

                await axios.post(`${this.$mainURL}:3000/userIMGUpload?userID=${userID}`, formData, {
                    headers: {
                        'Conent-Type': 'multipart/form-data',
                    }
                }).then(() => {
                    document.getElementById('imgUpload').value = "";
                    this.updateUserIMG(file.name).then(async () => {
                        await this.getUploads();
                    });
                });
            } catch (error) {
                console.error('Fehler beim Hochladen der Datei:', error);
            }
        },
        async updateUserIMG(imgName) {
            try {
                await this.postDB(`updateUserImg?userID=${this.$user.id}&img=${imgName}`).then(() => {
                    if ( imgName !== -1 && imgName !== null && imgName !== '' ) {
                        this.$user.activeImg = `/${this.mediaPath}/${this.userUploadPath}/${this.$user.id}/${imgName}`;
                        this.selectedImg = this.$user.activeImg;
                        document.getElementById('userIcon').src = `/${this.mediaPath}/${this.userUploadPath}/${this.$user.id}/${imgName}`;
                    } else {
                        this.$user.activeImg = `/${this.mediaPath}/avatar.webp`;
                        this.selectedImg = this.$user.activeImg;
                        document.getElementById('userIcon').src = `/${this.mediaPath}/avatar.webp`;
                    }
                    
                });
            } catch (error) {
                console.error('Fehler beim Hochladen der Datei:', error);
            }
        },
        async deleteUploadedUserImg() {
            var img = document.querySelector('input[name="userImg"]:checked').value;
            console.log(img);
 
            try {
                await this.postDB(`deleteUploadedUserImage?img=${img}&userID=${this.$user.id}`)
                .then(() => {
                    var newImg = -1;
                    if ( this.$user.uploads.length > 1 ) {
                        newImg = this.uploads.images[1].path;
                    }

                    this.updateUserIMG(newImg).then(() => {
                        this.getUploads();
  
                        this.selectedImg = this.$user.activeImg;
                        Fancybox.close();
                    });
                });
            } catch (err) {
                console.log(err);
            }
        }
    },
    async mounted() {
        if ( this.$user.id !== parseInt(this.$route.params.id) ) {
            this.userDBcheck = false;
            return;
        }

        this.userDBcheck = true;
        await this.getUploads();
    }
};
</script>

<style>
#app {

}
</style>
