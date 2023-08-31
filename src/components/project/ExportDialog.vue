<template>
    <q-card style="width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <q-btn v-close-popup dense flat icon="close" />
        </q-bar>
        <q-card-section>
            <div class="text-h6">
                {{ $t('exportSamples.title') }}
            </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
            <q-list bordered>
                <q-item v-if="canSeeOtherUsersTrees" tag="label" v-ripple>
                    <q-item-section side top>
                        <q-checkbox v-model="validated" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ $t('exportSamples.exportValidatedTrees') }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item v-if="canSaveTreeInProject" tag="label" v-ripple>
                    <q-item-section side top>
                        <q-checkbox v-model="user" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ $t('exportSamples.exportMyTrees') }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item v-if="canSeeOtherUsersTrees" tag="label" v-ripple>
                    <q-item-section side top>
                        <q-checkbox v-model="last" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ $t('exportSamples.exportRecentTrees') }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item v-if="otherUsers.length > 0 && canSeeOtherUsersTrees" tag="label" v-ripple>
                    <q-item-section side top>
                        <q-checkbox v-model="other" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ $t('exportSamples.exportTreesOfUsers') }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
            <div v-if="other">
                <q-select multiple dense outlined use-chips v-model="users" :options="otherUsers"
                    :label="$t('exportSamples.selectOtherUsers')" />
            </div>

        </q-card-section>
        <q-card-actions align="around">
            <q-btn :disable="disableExportBtn" v-close-popup color="primary" :label="$t('exportSamples.export')"
                @click="exportSamplesZip()"></q-btn>
        </q-card-actions>
    </q-card>
</template>

<script lang="ts">
import { notifyError, notifyMessage } from 'src/utils/notify';
import api from '../../api/backend-api';
import { defineComponent, PropType } from 'vue';
import { sample_t } from 'src/api/backend-types';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';


export default defineComponent({
    name: 'ExportDialog',
    props: {
        samples: {
            type: Object as PropType<sample_t[]>,
            required: true,
        },
    },
    data() {
        const users: string[] = [];
        return {
            user: false,
            last: false,
            other: false,
            validated: false,
            users,

        }
    },
    computed: {
        ...mapState(useUserStore, ['username']),
        ...mapState(useProjectStore, ['canSaveTreeInProject', 'canSeeOtherUsersTrees']),
        otherUsers() {
            let otherUsers: String[] = [];
            for (const sample of this.samples) {
                const sampleTreesFrom = sample.treesFrom;
                for (const userId of sampleTreesFrom) {
                    if (!otherUsers.includes(userId) && userId !== 'validated') {
                        otherUsers.push(userId);
                    }
                }
            }
            return otherUsers.filter(user => user != this.username);
        },
        projectName() {
            return this.$route.params.projectname;
        },
        disableExportBtn() {
            return !this.user && !this.last && !this.validated && (!this.other || this.users.length == 0);
        }
    },
    methods: {
        exportSamplesZip() {
            const sampleNames: string[] = [];
            var usersToExport: string[] = [];
            if (this.user) {
                usersToExport.push(this.username);
            }
            if (this.last) {
                usersToExport.push("last");
            }
            if (this.users.length > 0) {
                usersToExport = usersToExport.concat(this.users);
            }
            if (this.validated) {
                usersToExport.push("validated");
            }

            for (const sample of this.samples) {
                sampleNames.push(sample.sample_name);
            }
            const data = { sampleNames: sampleNames, users: usersToExport };
            api
                .exportSamplesZip(this.projectName as string, data)
                .then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `dump_${this.projectName}.zip`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    notifyMessage({ message: 'Files downloaded' });
                    return [];
                })
                .catch((error) => {
                    notifyError({ error });
                    return [];
                });
        },
    },
});
</script>

<style></style>
