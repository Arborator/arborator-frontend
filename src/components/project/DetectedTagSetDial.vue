<template>
  <q-card style="min-width: 700px">
    <q-bar class="bg-primary text-white sticky-bar">
      <q-space />
      <q-btn v-close-popup flat dense icon="close" @click="$emit('reload-tags-list')" />
    </q-bar>
    <q-card-section>
      <div class="text-h6">
        {{ $t('detectedTagSet.title') }}
      </div>
      <div>
        {{ $t('detectedTagSet.description') }}
      </div>
    </q-card-section>
    <q-card-section v-if="selectedPos.length">
      <div class="text-h6">UPOS</div>
      <q-checkbox 
        class="row q-gutter-md q-pa-md" 
        v-for="(upos, index) in newPos" 
        v-model="selectedPos[index]" 
        :label="upos" 
      />
    </q-card-section>
    <q-card-section v-if="selectedFeats.length">
      <div class="text-h6">Features</div>
      <q-checkbox 
        class="row q-gutter-md q-pa-md" 
        v-for="(feat, index) in newFeats" 
        v-model="selectedFeats[index]" 
        :label="feat"
      /> 
    </q-card-section>
    <q-card-section v-if="selectedMisc.length">
      <div class="text-h6">misc</div>
      <q-checkbox 
        class="row q-gutter-md q-pa-md" 
        v-for="(feat, index) in newMisc" 
        v-model="selectedMisc[index]" 
        :label="feat"
      /> 
    </q-card-section>
    <q-card-section v-if="selectedRelations.length">
      <div class="text-h6">Relations</div>
      <div class="row q-gutter-md q-pa-md" v-for="(rel, index) in newRel">
        <q-checkbox class="col" v-model="selectedRelations[index]" :label="rel.value" />
        <q-input class="col" dense outlined readonly v-model="annotationFeatures.DEPREL[rel.index].name"  />
      </div>
    </q-card-section>  
    <q-card-actions align="around">
      <q-btn color="primary" label="Save new annotation tag set" @click="saveNewAnnotationSchema()" />
    </q-card-actions>
  </q-card>
</template>
<script lang="ts">
import { annotationFeatures_t } from 'src/api/backend-types';
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { defineComponent, PropType } from 'vue';


export default defineComponent({
  name: 'DetectedTagSetDial',
  props: {
    newFeats: {
      type: Object as PropType<string[]>,
      required: true,
    },
    newMisc: {
      type: Object as PropType<string[]>,
      required: true,
    },
    newPos: {
      type: Object as PropType<string[]>,
      required: true,
    },
    newRel: {
      type: Object as PropType<any[]>,
      required: true,
    }
  },
  data() {
    return {
      selectedPos: [] as boolean[],
      selectedFeats: [] as boolean[],
      selectedMisc: [] as boolean[],
      selectedRelations: [] as boolean[],
      deprelOptions: [] as string[],
      currentAnnotationSchema: {} as annotationFeatures_t,
    }
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'annotationFeatures']),
  },
  mounted() {
    this.selectedPos = this.newPos.map(() => false);
    this.selectedFeats = this.newFeats.map(() => false);
    this.selectedMisc = this.newMisc.map(() => false);
    this.selectedRelations = this.newRel.map(() => false);
    this.deprelOptions = this.annotationFeatures.DEPREL.map((deprel) => deprel.name);
  },
  methods: {
    ...mapActions(useProjectStore, ['updateProjectConlluSchema']),
    saveNewAnnotationSchema() {
      for (const index in this.selectedPos) {
        if (this.selectedPos[index]) {
          this.annotationFeatures.UPOS.push(this.newPos[index]);
        }
      }
      for (const feat in this.selectedFeats) {
        if (this.selectedFeats[feat]) {
          this.annotationFeatures.FEATS.push({ name: this.newFeats[feat], values: [] });
        } 
      }
      for (const misc in this.selectedMisc) {
        if (this.selectedMisc[misc]) {
          this.annotationFeatures.MISC.push({ name: this.newMisc[misc], values: [] });
        }
      }
      for (const deprel in this.selectedRelations) {
        if (this.selectedRelations[deprel]) {
          const index = this.newRel[deprel].index;
          this.annotationFeatures.DEPREL[index].values.push(this.newRel[deprel].value);
        }
      }
      this.updateProjectConlluSchema(this.name, this.annotationFeatures, this.currentAnnotationSchema); 
      this.$emit('reload-tags-list');
    }
  }

})
</script>