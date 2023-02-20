<template>
  <div>
    <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 88] : [30, 10]" style="z-index: 999">
      <q-btn-group v-if="reltablebuttons" push flat rounded>
        <q-btn push color="primary" no-caps @click="getRelationTable('user')">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewUser')}} </q-tooltip>
          <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar" /></q-avatar>
          <q-icon v-else name="account_circle" />
        </q-btn>
        <q-btn push color="primary" no-caps @click="getRelationTable('user_recent')">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewUserRecent')}} </q-tooltip>
          <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar" /></q-avatar>
          <q-icon v-else name="account_circle" />
          <div>+</div>
        </q-btn>
        <q-btn v-if="isAdmin || isSuperAdmin" push icon="schedule" color="primary" no-caps @click="getRelationTable('recent')">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewRecent')}} </q-tooltip>
        </q-btn>
        <q-btn v-if="isAdmin || isSuperAdmin" push icon="ion-md-globe" color="primary" no-caps @click="getRelationTable('all')">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewAll')}} </q-tooltip>
        </q-btn>
      </q-btn-group>
      <q-btn size="20px" round color="primary text-green" icon="ion-md-grid" @click="reltablebuttons = !reltablebuttons">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipRelationTable')}} </q-tooltip>
      </q-btn>
    </q-page-sticky>

    <q-dialog v-model="relationTableDial" transition-show="fade" transition-hide="fade">
      <RelationTable :edges="relationTableInfos" :tableType="tableType"></RelationTable>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import RelationTable from './RelationTable.vue';

import api from '../../api/backend-api';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: {
    RelationTable,
  },
  props: {
    sampleName: {
      type: String as PropType<string>,
      default: '',
    },
  },
  data() {
    return {
      tableType:'',
      relationTableDial: false,
      relationTableInfos: {},
      reltablebuttons: false,
      window: { width: 0, height: 0 },
    };
  },

  computed: {
    ...mapState(useProjectStore, ['isAdmin']),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'avatar', 'getUserInfos']),
    breakpoint(): boolean {
      return this.window.width <= 400;
    },
  },
  methods: {
    getRelationTable(tableType: string) {
      const data = { sample_id: this.sampleName, tableType: tableType };
      api
        .getRelationTable(this.$route.params.projectname as string, data)
        .then((response) => {
          this.relationTableInfos = response.data;
          this.tableType = tableType;
          this.relationTableDial = true;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
});
</script>

<style></style>
