<template>
    <div class="col12">
        <table class="marg-bottom-no">
            <thead>
                <th>
                    <span class="marg-no"><a @click="changeDirectory(mainFolder, $event)" href="#" class="marg-no icon-left icon-home"></a>/</span>
                    <template v-for="(folder, index) in folderPathBreadcrumb" :key="index">
                        <span class="marg-no" v-if="index > 0"><a @click="changeDirectory(folder.path, $event)" href="#" style="margin: 0 10px !important;">{{ folder.name }}</a>/</span>
                    </template>
                </th>
            </thead>
            <tbody>
                <template v-for="(media, index) in folderStructure.children" :key="index">
                    <tr v-if="media.type === 'folder'">
                        <td><span class="marg-no icon-left icon-folder"><a @click="changeDirectory(media.path, $event)" href="#" class="marg-no">{{ media.name }}</a> /</span></td>
                    </tr>
                    <tr v-else>
                        <td>
                            <div class="col6">
                                <span class="marg-no icon-left icon-file">{{ media.name }}</span>
                            </div>
                            <div class="col6">
                                <table class="marg-no">
                                    <tbody>
                                        <tr>
                                            <td class="text-right" style="display: block; padding:0;">
                                                <a :href="`${$mainURL}/${media.path}`" data-fancybox class="btn btn-small btn-warning icon-only icon-eye marg-no"></a>

                                                <a v-if="$route.path !== '/media-browser'"
                                                href="#"  
                                                class="btn btn-small btn-success icon-only icon-check marg-bottom-no marg-left-xxs"
                                                @click="saveMediaPath(`${media.path}`, $event)"></a> 
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
    <div class="innerWrap marg-top-s">
        <div class="col12">
            <button class="btn btn-white hollow btn-small">Upload</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Fancybox } from '@fancyapps/ui';
//import langSnippet from './mixins/language.vue';
//import mainFunctions from './mixins/functions.vue';

export default {
    name: 'MediaBrowser',
    //mixins: [mainFunctions],
    data() {
        return {
            folderStructure: {},
            mainFolder: 'public/media/bibliothek',
            folderPathBreadcrumb: []
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
        }
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
