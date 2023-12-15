<template>
    <div class="innerWrap">
        <div class="col12">
            <div class="table marg-bottom-no">
                <div class="thead">
                    <div class="th">
                        <span class="marg-no"><a @click="changeDirectory(mainFolder, $event)" href="#" class="marg-no icon-left icon-home"></a>/</span>
                        <template v-for="(folder, index) in folderPathBreadcrumb" :key="index">
                            <span class="marg-no" v-if="index > 0"><a @click="changeDirectory(folder.path, $event)" href="#" style="margin: 0 10px !important;">{{ folder.name }}</a>/</span>
                        </template>
                    </div>
                </div>
            </div>

            <table class="not-fixed-layout marg-bottom-no">
                <tbody>
                    <template v-if="folderStructure.children && folderStructure.children.length > 0">
                        <template v-for="(media, index) in folderStructure.children" :key="index">
                            <tr v-if="media.type === 'folder'">
                                <td>
                                    <span class="marg-no icon-left icon-folder">
                                        <a @click="changeDirectory(media.path, $event)" class="marg-no">{{ media.name }}</a> /
                                    </span>
                                </td>
                                <td>
                                    <button href="#renameFolder" data-fancybox @click="setOldFolder(media.name)" class="btn btn-small btn-warning icon-only icon-pen marg-no" :title="langSnippet('rename_folder')"></button>
                                </td>
                                <td>
                                    <button href="#deleteFolder"
                                    data-fancybox
                                    class="btn btn-small btn-alert icon-only icon-trash marg-bottom-no"
                                    :title="langSnippet('delete')"
                                    @click="selectFolder(media.path)"></button>
                                </td>
                            </tr>
                            <tr v-else>
                                <td>
                                    <span class="marg-no icon-left icon-file">{{ media.name }}</span>
                                </td>
                                <td class="text-right">
                                    <button :href="`${$mainURL}/${media.path}`" data-fancybox class="btn btn-small btn-warning icon-only icon-eye marg-no"></button>
                                </td>
                                <td v-if="$route.path !== '/media-browser'" class="text-right">
                                    <button
                                    href="#"  
                                    class="btn btn-small btn-success icon-only icon-check marg-bottom-no marg-left-xxs"
                                    @click="saveMediaPath(`${media.path}`, $event)"></button>
                                </td>
                            </tr>
                            
                        </template>
                    </template>
                    <template v-else>
                        <tr>
                            <td>...</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
        <div class="marg-top-xs" v-if="$route.path === '/media-browser'">
            <div class="row">
                <span class="column">
                    <span class="input-file-wrap">
                        <span class="btn btn-white btn-small icon-left icon-upload marg-no loading">{{ langSnippet('upload_file') }}</span>
                        <input type="file" accept=".mp4" ref="fileInput" @change="uploadVideo()">
                    </span>                    
                </span>
                <span class="column">
                    <button href="#createFolder" data-fancybox class="btn btn-white btn-small hollow icon-left icon-save marg-no">{{ langSnippet('create_folder') }}</button>
                </span>         
            </div>
        </div>
    </div>

    <!-- Fancyboxes -->
    <div style="display: none" v-if="$route.path === '/media-browser'">

        <div id="createFolder">
            <form @submit.prevent="createNewFolder(newFolderName)">
                <p>
                    <label>{{ langSnippet('folder_name') }}
                        <input type="text" v-model="newFolderName" name="newFolderName" id="newFolderName">
                        <span v-if="folderExists" class="text-alert">{{ langSnippet('folder_already_exists') }}</span>
                    </label>
                </p>
                <p class="text-right marg-no">
                    <button type="submit" class="btn btn-small btn-success icon-left icon-folder marg-no">{{ langSnippet('create_folder') }}</button>
                </p>
            </form>
        </div>

        <div id="renameFolder">
            <form @submit.prevent="renameFolder()">
                <p>
                    <label>{{ langSnippet('new_folder_name') }}
                        <input type="text" v-model="renameFolderName" name="renameFolderName" id="renameFolderName">
                        <span v-if="folderExists" class="text-alert">{{ langSnippet('folder_name_not_empty') }}</span>
                    </label>
                </p>
                <p class="text-right marg-no">
                    <button type="submit" class="btn btn-small btn-success icon-left icon-folder marg-no">{{ langSnippet('rename_folder') }}</button>
                </p>
            </form>
        </div>

        <div id="deleteFolder">
            <p>
                {{ langSnippet('delete_folder') }}
            </p>
            <p class="text-right marg-no">
                <button type="submit" @click="deleteFolder(selectedFolder)" class="btn btn-small btn-alert icon-left icon-trash marg-no">{{ langSnippet('delete') }}</button>
            </p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Fancybox } from '@fancyapps/ui';
import langSnippet from './mixins/language.vue';
import mainFunctions from './mixins/functions.vue';

export default {
    name: 'MediaBrowser',
    mixins: [langSnippet, mainFunctions],
    data() {
        return {
            folderStructure: {},
            mainFolder: 'public/media/bibliothek',
            folderPathBreadcrumb: [],
            selectedFolder: null,
            newFolderName: null,
            folderExists: null,
            oldFolderName: null,
            renameFolderName: null,
        };
    },
    methods: {
        async getFileStructure(folder) {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/getFolderStructure`, { params: {folder}});
                this.folderStructure = response.data;
                var currentFolderPath = this.folderStructure.path;

                // Entferne den Basispfad
                const relativePath = currentFolderPath.slice(this.mainFolder.length);

                // Teile den Pfad in Verzeichnisse und Dateinamen auf
                const parts = relativePath.split('/');
                const breadCrumbArray = parts.reduce((accumulator, currentString) => {
                    if (accumulator.length === 0) {
                        // Das ist das erste Element im Array
                        accumulator.push(currentString);
                    } else {
                        // Füge das aktuelle Element mit einem '/' am Ende zum vorherigen Element hinzu
                        const previousString = accumulator[accumulator.length - 1];
                        const concatenatedString = `${previousString}/${currentString}`;
                        accumulator.push(concatenatedString);
                    }
                    return accumulator;
                }, []);

                const finalParts = breadCrumbArray.map((path) => {
                    const parts = path.split('/');
                    return {
                        name: parts[parts.length - 1],
                        path: this.mainFolder+path,
                    };
                });

                this.folderPathBreadcrumb = finalParts;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return [];
            }
        },
        async changeDirectory(folder, event) {
            event.preventDefault();
            try {
                this.getFileStructure(folder);
            } catch (err) {
                console.log(err);
            }            
        },
        async saveMediaPath(path, event) {
            event.preventDefault();
            var media = this.$route.params.media;
            var mediaType = media.media_type;

            try {
                if ( mediaType === 'movie' ) {
                    mediaType = 'media';
                    const mediaID = media.tmdbID
                    const videoPath = `/${path}`;

                    await axios.post(`${this.$mainURL}:3000/api/db/addVideoPathToMedia`, {
                        params: {
                            mediaType,
                            mediaID,
                            videoPath
                        }
                    }).then(() => {
                        Fancybox.close();
                    });                
                } else {
                    mediaType = 'episodes';
                    const mediaID = this.$route.params.episodeID;
                    const videoPath = `/${path}`;

                    await axios.post(`${this.$mainURL}:3000/api/db/addVideoPathToMedia`, {
                        params: {
                            mediaType,
                            mediaID,
                            videoPath
                        }
                    }).then(() => {
                        Fancybox.close();
                    });  
                }
            } catch (err) {
                console.log(err);
            }
        },
        async createNewFolder(folderName) {
            if ( folderName !== null && folderName !== '' ) {
                const folder = `${this.folderStructure.path}/${folderName}`;

                try {
                    await axios.post(`${this.$mainURL}:3000/createFolder`, {
                        params: {
                            folder
                        }
                    }).then(() => {
                        this.newFolderName = null;
                        this.folderExists = null;
                        this.changeDirectory(this.folderStructure.path, event);
                        Fancybox.close();
                    });
                } catch (err) {
                    console.log(err.response.data);
                    this.folderExists = err.response.data;
                }
            }
        },
        setOldFolder(folderName) {
            this.renameFolderName = folderName;
            this.oldFolderName = folderName;
        },
        selectFolder(folderName) {
            this.selectedFolder = folderName;
        },
        async renameFolder() {
            if ( this.oldFolderName ===  this.renameFolderName ) {
                return;
            } else if ( this.oldFolderName !== null && this.renameFolderName !== '') {
                const oldName = `${this.folderStructure.path}/${this.oldFolderName}`;
                const newName = `${this.folderStructure.path}/${this.renameFolderName}`;

                try {
                    await axios.post(`${this.$mainURL}:3000/renameFolder`, {
                        params: {
                            oldName,
                            newName
                        }
                    }).then(() => {
                        this.oldFolderName = null;
                        this.renameFolderName = null;
                        this.changeDirectory(this.folderStructure.path, event);
                        Fancybox.close();
                    });
                } catch (err) {
                    console.log(err.response.data);
                    this.folderExists = err.response.data;
                }
            }
        },
        async deleteFolder(folder) {
            try {
                await axios.post(`${this.$mainURL}:3000/deleteFolder`, {
                    params: {
                        folder
                    }
                }).then(() => {
                    this.selectedFolder = null;
                    this.changeDirectory(this.mainFolder, event);
                    Fancybox.close();
                });
            } catch (err) {
                console.log(err.response.data);
                this.folderExists = err.response.data;
            }
        },
        async uploadVideo() {
            const folder = this.folderStructure.path;
            const fileInput = this.$refs.fileInput;
            const file = fileInput.files[0];

            if (file) {
                const formData = new FormData();
                formData.append('mp4File', file);
                console.log(formData);
                try {
                    await axios.post(`${this.$mainURL}:3000/uploadVideo?folder=${folder}`, formData, {
                        headers: {
                            'Conent-Type': 'multipart/form-data',
                        }
                    })
                    .then(() => {
                        this.changeDirectory(this.folderStructure.path, event);
                    });
                } catch (err) {
                    console.log(err.response.data);
                    this.folderExists = err.response.data;
                }
            }
        },
    },
    mounted() {
        this.getFileStructure(this.mainFolder);
    }
};
</script>

<style>
#app {

}
</style>
