<template>
    <q-dialog v-model="isShowAddLangDialog">
        <q-card style="min-width: 50vw;">
            <q-bar class="bg-primary text-white">
                <q-space />
                <q-btn dense flat icon="close" v-close-popup /> 
            </q-bar>
            <q-card-section class="text-h6">
                Add your project language
            </q-card-section>
            <q-card-section class="row q-gutter-md">
                <div class="col-10">
                    <LanguageSelect :multiple="false" @selected-value="getSelectedLanguage" />   
                </div>
                <div class="col">
                    <q-btn color="primary" label="Add" @click="updateProjectLanguage"/>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">

import LanguageSelect from "../components/shared/LanguageSelect.vue"

import { mapActions, mapWritableState } from "pinia";
import { useProjectStore } from "src/pinia/modules/project";
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'ProjectLangNotif',
    components: {
        LanguageSelect
    },
    data(){
        return {
            selectedLanguage: '',
            isShowAddLangDialog: true,
        }
    },
    computed: {
        ...mapWritableState(useProjectStore, ['language']),
    },
    methods: {
        ...mapActions(useProjectStore, ['updateProjectSettings']),
        getSelectedLanguage(value: any) {
            this.selectedLanguage = value;
        },
        updateProjectLanguage() {
            this.updateProjectSettings({language: this.selectedLanguage as string});
            this.isShowAddLangDialog = false;
        }
    }

});

</script>