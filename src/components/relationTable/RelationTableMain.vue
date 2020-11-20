<template>
  <div>
    <q-page-sticky
      :position="breakpoint ? 'bottom-right' : 'bottom-right'"
      :offset="breakpoint ? [18, 88] : [30, 10]"
      style="z-index: 999"
    >
      <q-btn-group push flat rounded v-if="reltablebuttons">
        <q-btn @click="getRelationTable('user')" push color="primary" no-caps>
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
            View only my trees
          </q-tooltip>
          <q-avatar v-if="isLoggedIn" size="1.2rem"
            ><img :src="avatar"
          /></q-avatar>
          <q-icon v-else name="account_circle" />
        </q-btn>
        <q-btn
          @click="getRelationTable('user_recent')"
          push
          color="primary"
          no-caps
        >
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
            View my trees, filled up with the most recent trees
          </q-tooltip>
          <q-avatar v-if="isLoggedIn" size="1.2rem"
            ><img :src="avatar"
          /></q-avatar>
          <q-icon v-else name="account_circle" />
          <div>+</div>
        </q-btn>
        <q-btn
          @click="getRelationTable('recent')"
          push
          icon="schedule"
          color="primary"
          no-caps
          v-if="isAdmin || isSuperAdmin"
        >
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
            View most recent trees
          </q-tooltip>
        </q-btn>
        <q-btn
          @click="getRelationTable('all')"
          push
          icon="ion-md-globe"
          color="primary"
          no-caps
          v-if="isAdmin || isSuperAdmin"
        >
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
            View all trees
          </q-tooltip>
        </q-btn>
      </q-btn-group>
      <q-btn
        size="20px"
        round
        @click="reltablebuttons = !reltablebuttons"
        color="primary text-green"
        icon="ion-md-grid"
      >
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
          Get Relation Tables
        </q-tooltip>
      </q-btn>
    </q-page-sticky>

    <q-dialog
      v-model="relationTableDial"
      transition-show="fade"
      transition-hide="fade"
    >
      <RelationTable :edges="relationTableInfos"></RelationTable>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import RelationTable from "./RelationTable";
import ResultView from "../ResultView";

import api from "../../boot/backend-api";

export default {
  components: {
    ResultView,
    RelationTable,
  },
  data() {
    return {
      relationTableDial: false,
      relationTableInfos: {},
      reltablebuttons: false,
      window: { width: 0, height: 0 },
    };
  },
  computed: {
    ...mapGetters("config", ["isAdmin"]),
    ...mapGetters("user", ["isLoggedIn", "isSuperAdmin", "avatar"]),
    breakpoint() {
      return this.window.width <= 400;
    },
  },
  methods: {
    getRelationTable(type) {
      var data = { table_type: type };
      api
        .getRelationTable(this.$route.params.projectname, data)
        .then((response) => {
          this.relationTableInfos = response.data;
          this.relationTableDial = true;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
  },
};
</script>

<style>
</style>