<template>
  <q-card :class="$q.dark.isActive ? '' : 'bg-blue-grey-1 text-black'" style="max-width: 100vw">
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">User Assignment for {{ $route.params.projectname }}</div>
      <q-space />
      <q-btn v-close-popup dense flat icon="close">
        <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
      </q-btn>
    </q-bar>

    <q-card-section>
      {{ samples }}
      <q-table
        ref="usersTable"
        v-model:selected="table.selected"
        class="dark rounded-borders"
        title="Users"
        :rows="data"
        :columns="table.fields"
        row-key="username"
        :v-model:pagination="table.pagination"
        :loading="table.loading"
        loading-label="loading"
        :filter="table.filter"
        binary-state-sort
        :visible-columns="table.visibleColumns"
        selection="multiple"
        dense
        table-header-class="text-primary"
        card-class="shadow-8"
        style="height: 80vh; width: 90vw"
        virtual-scroll
        table-style="max-height:80vh"
        :rows-per-page-options="[0]"
      >
        <template #top="props">
          <q-btn-group flat>
            <q-btn rounded push color="primary" label="validate" :disabled="table.selected.length < 1">
              <q-tooltip :delay="300" content-class="text-white bg-primary">Validate</q-tooltip>
            </q-btn>
          </q-btn-group>

          <q-space />

          <q-input v-model="table.filter" dense debounce="300" placeholder="Search" text-color="blue-grey-8">
            <template #append>
              <q-icon name="search" />
            </template>
            <q-tooltip :delay="300" content-class="bg-white text-primary">Search a user</q-tooltip>
          </q-input>

          <q-space />

          <q-select
            v-model="table.visibleColumns"
            multiple
            borderless
            dense
            options-dense
            :display-value="$q.lang.table.columns"
            emit-value
            map-options
            :options="filterFields(table)"
            option-value="name"
            style="min-width: 100px"
          >
            <q-tooltip :delay="300" content-class="bg-white text-primary">Select visible columns</q-tooltip>
          </q-select>

          <q-btn
            flat
            round
            dense
            text-color="blue-grey-8"
            :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            class="q-ml-md"
            @click="props.toggleFullscreen"
          />
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td auto-width><q-toggle v-model="props.selected" dense /></q-td>
            <q-td key="picture_url" :props="props"
              ><q-avatar size="24px"><img :src="props.row.picture_url" /></q-avatar
            ></q-td>
            <q-td key="name" :props="props">{{ props.row.username }}</q-td>
            <q-td key="email" :props="props">{{ props.row.id }}</q-td>
            <q-td key="super_admin" :props="props">{{ props.row.super_admin }}</q-td>
            <q-td key="last_seen" :props="props">{{ props.row.last_seen }}</q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { table_t } from 'src/types/main_types';
import api from '../api/backend-api';
import notifyError from 'src/utils/notify';
import { user_t } from 'src/api/backend-types';

export default {
  props: ['samples'],
  data() {
    const table: table_t<unknown> = {
      fields: [
        { name: 'picture_url', label: 'Avatar', field: 'picture_url', sortable: false },
        {
          name: 'name',
          label: 'Name',
          field: 'username',
          sortable: true,
        },
        {
          name: 'email',
          label: 'Mail',
          field: 'id',
          sortable: true,
        },
        {
          name: 'super_admin',
          label: 'Admin',
          field: 'super_admin',
          sortable: true,
        },
        {
          name: 'last_seen',
          label: 'Last Seen',
          field: 'last_seen',
          sortable: true,
        },
      ],
      visibleColumns: ['picture_url', 'name'],
      filter: '',
      selected: [],
      loading: false,
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
    };

    const data: user_t[] = [];
    return {
      table,
      data,
    };
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    /**
     * Filter the fields (visible columns) given the table in json format
     *
     * @param {Object} tableJson
     * @returns {Array} array of fields
     */
    filterFields(tableJson: table_t<unknown>) {
      const tempArray = tableJson.fields.filter((obj) => obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions');
      return tempArray;
    },
    /**
     * Retrieve users from backend and populate the table data
     *
     * @returns void
     */
    getUsers() {
      api
        .getUsers()
        .then((response) => {
          this.data = response.data;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
};
</script>
