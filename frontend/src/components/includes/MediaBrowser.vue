<template>
    <div class="mediabrowser-wrap">
        <div class="col12">

            <div class="table rounded">
                <div class="thead">
                    <div class="th">
                        <span class="marg-no"><a href="#" @click="changeDirectory(mainFolder, $event)" class="marg-no icon-left icon-home"></a>/</span>
                        <template v-for="(folder, index) in folderPathBreadcrumb" :key="index">
                            <span class="marg-no" v-if="index > 0"><a href="#" @click="changeDirectory(folder.path, $event)" style="margin: 0 10px !important;">{{ folder.name }}</a>/</span>
                        </template>
                    </div>
                </div>
            </div>

            <table class="not-fixed-layout marg-bottom-no rounded">
                <tbody>
                    <template v-for="(folder, index) in folderPathBreadcrumb" :key="index">
                        <tr v-if="index === (folderPathBreadcrumb.length-1) && index > 0" class="bg-black">
                            <td>
                                <span class="marg-no">
                                    <a href="#" @click="changeDirectory(folderPathBreadcrumb[index-1].path, $event)" class="marg-no icon-left icon-back">.. /</a>
                                </span>
                            </td>
                        </tr>
                    </template>

                    <!--- If type folder only contains .gitignore --->
                    <template v-if="folderStructure.children && folderStructure.children.length === 1 && folderStructure.children[0].name === '.gitignore'">
                        <tr>
                            <td>...</td>
                        </tr>
                    </template>

                    <template v-else-if="folderStructure.children && folderStructure.children.length > 0">
                        <template v-for="(media, index) in folderStructure.children" :key="index">

                            <!--- If type is folder --->
                            <tr v-if="media.type === 'folder'" class="folder">
                                <td>
                                    <span class="marg-no">
                                        <a href="#" @click="changeDirectory(media.path, $event)" class="icon-left icon-folder marg-no">{{ media.name }} /</a>
                                    </span>
                                </td>

                                <!--- Rename folder button --->
                                <td class="text-right" v-if="$route.path === '/b/content-manager'">
                                    <button
                                    href="#renameFolder"
                                    data-fancybox @click="setOldFolder(media.name)"
                                    class="btn btn-transparent icon-only icon-pen marg-no"
                                    :title="langSnippet('rename_folder')"></button>
                                </td>

                                <!--- Delete folder button --->
                                <td class="text-right" v-if="$route.path === '/b/content-manager'">
                                    <button
                                    href="#deleteFolder"
                                    data-fancybox
                                    class="btn btn-alert icon-only icon-trash marg-bottom-no"
                                    :title="langSnippet('delete')"
                                    @click="selectFolder(media.path)"></button>
                                </td>
                            </tr>

                            <!--- If page is NOT media-browser and file is MP4 --->
                            <tr v-else-if="$route.path !== '/b/content-manager' && media.name.endsWith('.mp4') && media.name !== '.gitignore'">
                                <td>
                                    <span class="marg-no icon-left icon-movie">{{ media.name }}</span>
                                </td>

                                <!--- Preview file button --->
                                <td class="text-right">
                                    <button
                                    :href="`${$mainURL}:8080/${media.path.replace('public/', '')}`"
                                    :title="langSnippet('preview')"
                                    data-fancybox
                                    class="btn btn-transparent icon-only icon-eye marg-no"></button>
                                </td>

                                <!--- Select file button --->
                                <td v-if="$route.path !== '/b/content-manager' && '/'+media.path !== mediaPath" class="text-right">
                                    <button
                                    href="#"
                                    :title="langSnippet('select')"
                                    class="btn btn-success icon-only icon-check marg-bottom-no"
                                    @click="saveMediaPath(`${media.path}`, $event)"></button>
                                </td>
                            </tr>

                            <!--- If page is media-browser --->
                            <tr v-else-if="$route.path === '/b/content-manager' && media.name !== '.gitignore'">
                                <td>
                                    <span v-if="media.name.endsWith('.mp4')" class="marg-no icon-left icon-movie">{{ media.name }}</span>
                                    <span v-else-if="media.name.endsWith('.jpg') || media.name.endsWith('.jpeg') || media.name.endsWith('.png') || media.name.endsWith('.gif')" class="marg-no icon-left icon-image">{{ media.name }}</span>
                                    <span v-else class="marg-no icon-left icon-file">{{ media.name }}</span>
                                </td>

                                <!--- Preview file button --->
                                <td class="text-right">
                                    <button
                                    :href="`${$mainURL}:8080/${media.path.replace('public/', '')}`"
                                    :title="langSnippet('preview')"
                                    data-fancybox
                                    class="btn btn-transparent icon-only icon-eye marg-no"></button>
                                </td>

                                <!--- Delete file button --->
                                <td class="text-right">
                                    <button href="#deleteFile"
                                    data-fancybox
                                    class="btn btn-alert icon-only icon-trash marg-bottom-no"
                                    :title="langSnippet('delete')"
                                    @click="selectFile(media.path, media.name)"></button>
                                </td>
                            </tr>
                            
                        </template>
                    </template>

                    <!--- If current folder is empty --->
                    <template v-else>
                        <tr>
                            <td>...</td>
                        </tr>
                    </template>

                </tbody>
            </table>
        </div>

        <div class="marg-top-xs" v-if="$route.path === '/b/content-manager'">
            <div class="row">

                <span class="column marg-no">
                    <p>
                        <span class="input-file-wrap">
                            <span class="btn btn-white btn-small icon-left icon-upload marg-no loading">{{ langSnippet('upload_file') }}</span>
                            <input type="file" accept=".mp4" ref="fileInput" @change="uploadVideo()">
                        </span>
                    </p>
                </span>

                <span class="column marg-no">
                    <p>
                        <button href="#createFolder" data-fancybox class="btn btn-secondary btn-small icon-left icon-folder marg-no">{{ langSnippet('create_folder') }}</button>
                    </p>
                </span>

            </div>
        </div>
    </div>

    <!-- Fancyboxes -->
    <div style="display: none" v-if="$route.path === '/b/content-manager'">

        <div id="createFolder">
            <form @submit.prevent="createNewFolder(newFolderName)">
                <p>
                    <span class="input-wrap">
                        <label for="newFolderName">{{ langSnippet('folder_name') }}</label>
                        <input type="text" v-model="newFolderName" name="newFolderName" id="newFolderName">
                    </span>
                    <span v-if="folderExists" class="text-alert formfield-alert">{{ langSnippet('folder_already_exists') }}</span>
                </p>
                <p class="text-right marg-no">
                    <button type="submit" class="btn btn-success btn-small icon-left icon-folder marg-no">{{ langSnippet('create_folder') }}</button>
                </p>
            </form>
        </div>

        <div id="renameFolder">
            <form @submit.prevent="renameFolder()">
                <p>
                    <span class="input-wrap">
                        <label for="renameFolderName">{{ langSnippet('new_folder_name') }}</label>
                        <input type="text" v-model="renameFolderName" name="renameFolderName" id="renameFolderName">
                    </span>
                    <span v-if="folderExists" class="text-alert">{{ langSnippet('folder_name_not_empty') }}</span>
                </p>
                <p class="text-right marg-no">
                    <button type="submit" class="btn btn-success btn-small icon-left icon-folder marg-no">{{ langSnippet('rename_folder') }}</button>
                </p>
            </form>
        </div>

        <div id="deleteFolder">
            <p>
                {{ langSnippet('delete_folder') }}
            </p>
            <p class="text-right marg-no">
                <button type="submit" @click="deleteFolder(selectedFolder)" class="btn btn-alert btn-small icon-left icon-trash marg-no">{{ langSnippet('delete') }}</button>
            </p>
        </div>

        
        <div id="deleteFile">
            <p>
                {{ langSnippet('delete_file') }}
            </p>
            <p class="text-right marg-no">
                <button type="submit" @click="deleteFile(selectedFile)" class="btn btn-alert btn-small icon-left icon-trash marg-no">{{ langSnippet('delete') }}</button>
            </p>
        </div>
    </div>

    <div class="innerWrap" v-if="mediaPath">
        <div class="col12">
            <p class="marg-top-xs marg-bottom-no">{{ langSnippet('current_selected') }}: <span id="currentMediaPath" class="strong">{{ mediaPath.replace(`/${mainFolder}`, '') }}</span></p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Fancybox } from '@fancyapps/ui';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../functions.vue';

export default {
    name: 'MediaBrowser',
    mixins: [langSnippet, mainFunctions],
    props: ['selectedMedia', 'onMediaPopUp'],
    data() {
        return {
            folderStructure: {},
            mainFolder: 'public/media/bibliothek',
            mediaFolder: 'media/bibliothek',
            folderPathBreadcrumb: [],
            selectedFolder: null,
            newFolderName: null,
            folderExists: null,
            oldFolderName: null,
            renameFolderName: null,
            selectedFile: null,
            mediaPath: null,
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

                    await this.postDB(`addVideoPathToMedia`, {
                        params: {
                            mediaType,
                            mediaID,
                            videoPath
                        }
                    }).then(() => {
                        Fancybox.close();
                        this.mediaPath = videoPath;
                        this.$route.params.selectedFile = videoPath;
                    });                
                } else {
                    mediaType = 'episodes';
                    const mediaID = this.$route.params.episodeID;
                    const videoPath = `/${path}`;
                    this.$route.params.selectedFile = videoPath;

                    await this.postDB(`addVideoPathToMedia`, {
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
        async deleteFile(file) {
            var filePath = String(file[0]);

            try {
                await axios.post(`${this.$mainURL}:3000/deleteFile`, {
                    params: {
                        filePath
                    }
                }).then(() => {
                    this.changeDirectory(this.mainFolder, event);
                    Fancybox.close();
                });
            } catch (err) {
                console.log(err.response.data);
            }
        },
        async uploadVideo() {
            const folder = this.folderStructure.path;
            const fileInput = this.$refs.fileInput;
            const file = fileInput.files[0];

            if (file && file.type === 'video/mp4') {
                const formData = new FormData();
                formData.append('mp4File', file);

                try {
                    await axios.post(`${this.$mainURL}:3000/uploadVideo?folder=${folder}`, formData, {
                        headers: {
                            'Conent-Type': 'multipart/form-data',
                        }
                    })
                    this.changeDirectory(this.folderStructure.path, event);
                } catch (err) {
                    console.log(err.response.data);
                    this.folderExists = err.response.data;
                }
            } else {
                alert('No Video');
            }
        },
        selectFile(mediaPath, filename) {
            this.selectedFile = [
                mediaPath, filename
            ]
        }
    },
    mounted() {
        if (this.selectedMedia) {
            this.mediaPath = this.selectedMedia;
            var lastSlashIndex = this.selectedMedia.lastIndexOf('/');
            var pathWithoutFilename = this.selectedMedia.substring(1, lastSlashIndex);
            this.getFileStructure(pathWithoutFilename);
        } else {
            this.getFileStructure(this.mainFolder);
        }
    }
};
</script>

<style>
#app {

}
</style>
