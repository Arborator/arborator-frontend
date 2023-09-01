<template>
    <q-select
        v-model="selectedLanguages"
        @update:model-value="emitSelectedVal"
        outlined
        dense
        use-input
        hide-dropdown-icon
        option-value="name"
        :options="filteredLanguagesList"
        :multiple="multiple"
        stack-label
        emit-value
        label="Language"
        @filter="filterLanguages"
    >
        <template v-slot:selected-item="scope">
            <q-chip 
                v-if="scope.opt.length > 0" 
                removable 
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex" 
                dense 
                text-color="primary"
            >          
            {{ scope.opt }}
            </q-chip>
        </template>
        <template v-slot:option="scope">
            <q-item v-close-popup v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
            </q-item>
        </template>
        </q-select>
</template>

<script lang="ts">

import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';

import { defineComponent, PropType} from 'vue';

export default defineComponent({
  
  name:'LanguageSelect',
  props: {
    multiple: {
        type: Boolean as PropType<boolean>,
        required: true, 
    }
  },
  data() {
    const filteredLanguagesList: { index: number, name: string}[] = [];
    return {
        filteredLanguagesList, 
        selectedLanguages: [],
    };
  },
  computed: {
    ...mapState(useProjectStore, ['languagesList']),
  },
  methods: {
    emitSelectedVal() {
        this.$emit('selected-value', this.selectedLanguages)
    }, 
    filterLanguages(val: string, update: (callback: () => void) => void) {
            
        if (val === '') {
            update(() => {
                this.filteredLanguagesList = this.languagesList;
            });
            return;
        }
        update(() => {
            const needle = val.toLowerCase();
            this.filteredLanguagesList = this.languagesList.filter(v => v.name.toLowerCase().indexOf(needle) > -1);
        });
    },
  },
});

</script>