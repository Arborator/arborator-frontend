<template>
  <div class="row q-col-gutter-md">
    <div class="col">
      <q-select
        dense
        outlined
        :label="$t('grewSearch.selectSample')"
        v-model="selectedSamples"
        :options="samples.map(sample => sample.sampleName)"
        multiple
        use-chips
        option-label="sample_name"
        @update:model-value="emitSelectedValues"
      >
      </q-select>
    </div>
    <div class="col">
      <q-select
        dense
        outlined
        v-model="treeType"
        :options="treeOptions"
        :label="$t('grewSearch.treesType')"
        color="primary"
        @update:model-value="emitSelectedValues"
      >
        <template v-slot:selected-item="scope">
          <q-chip v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'" dense square color="white" text-color="primary" size="md">
            <q-avatar>
              <img :src="avatar" alt="avatar" />
              <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent>+</q-badge>
            </q-avatar>
            {{ scope.opt.label }}
          </q-chip>
          <q-chip v-else dense square text-color="primary" size="md" :label="scope.opt.label" :icon="scope.opt.icon" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-avatar v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'" size="1.2rem">
                <img :src="avatar" alt="avatar" />
                <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent color="principal">+</q-badge>
              </q-avatar>
              <q-icon v-else :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
    <div class="col">
      <q-select
        v-if="treeType.value === 'others'"
        v-model="otherUser"
        outlined
        dense
        :options="treesFrom"
        :label="$t('grewSearch.selectUser')"
        @update:model-value="emitSelectedValues"
      >
      </q-select>
    </div>
  </div>
</template>
<script lang="ts">
import { mapState } from 'pinia';
import { sample_t } from 'src/api/backend-types';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  name: 'TreesTypeSelect',
  props: {
    grewOption: {
      type: String as PropType<string>,
      required: true,
    },
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const treeTypes = [
      { value: 'recent', label: this.$t('grewSearch.recentTree'), icon: 'schedule' },
      { value: 'user', label: this.$t('grewSearch.userTree') },
      { value: 'validated', label: this.$t('grewSearch.validatedTree'), icon: 'verified' },
      { value: 'pending', label: this.$t('grewSearch.pendingTree'), icon: 'pending' },
      { value: 'all', label: this.$t('grewSearch.allTree'), icon: 'groups' },
      { value: 'base_tree', label: this.$t('grewSearch.baseTree'), icon: 'linear_scale' },
      { value: 'others', label: this.$t('grewSearch.otherTree'), icon: 'group' },
    ];
    const treeType = this.collaborativeMode ?  treeTypes[0] : treeTypes[2];
    const selectedSamples: sample_t[] = [];
    return {
      selectedSamples,
      treeType,
      otherUser: '',
      treeTypes,
    };
  },
  computed: {
    ...mapState(useUserStore, ['avatar']),
    ...mapState(useGrewSearchStore, ['grewTreeTypes', 'lastQuery']),
    ...mapState(useProjectStore, ['collaborativeMode']),
    treeOptions() {
      if (this.grewOption == 'SEARCH') {
        return this.treeTypes.filter((element) => this.grewTreeTypes.includes(element.value));
      } else {
        return this.treeTypes.filter((element) => this.grewTreeTypes.includes(element.value) && !['all', 'pending'].includes(element.value));
      }
    },
    treesFrom() {
      const samples = this.selectedSamples.length ? this.selectedSamples : this.samples;
      return [...new Set(samples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []))];
    },
  },
  watch: {
    grewOption(newVal) {
      if (newVal === 'REWRITE' && this.treeType.value === 'all') {
        this.treeType = this.treeTypes[0];
      }
    },
  },
  mounted() {
    if (this.collaborativeMode) {
      this.treeType = this.lastQuery !== null ? this.treeTypes.filter((option) => option.value === this.lastQuery?.userType)[0] : this.treeTypes[0];
    }
  },
  methods: {
    emitSelectedValues() {
      const data = {
        selectedSamples: this.selectedSamples.map((sample) => sample.sampleName),
        treeType: this.treeType.value,
        otherUser: this.otherUser,
      };
      this.$emit('selected-value', data);
    },
  },
});
</script>
