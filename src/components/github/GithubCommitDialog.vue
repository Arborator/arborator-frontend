<template>
  <q-card style="min-width: 50vw">
    <q-card-section>
      <div class="text-h6 text-left">{{ $t('github.commitDialog.title') }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-form class="q-gutter-md">
        <div class="row q-gutter-md">
          <div class="col-8">
            <q-input outlined v-model="message" :label="$t('github.commitDialog.commitInput')" />
          </div>
          <div class="col">
            <q-select
              outlined
              v-model="trees"
              :options="options"
              :label="$t('github.commitDialog.commitTreeSelect')"
              color="primary"
              options-selected-class="primary"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar v-if="scope.opt.value == 'user'" size="1.2rem">
                      <img :src="avatar" />
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
        </div>
        <div class="row q-gutter-md justify-center">
          <q-btn :disable="trees.value == ''" label="commit" color="primary" @click="commitChanges(trees.value)" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import api from '../../api/backend-api';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'GithubCommitDialog',
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    repositoryName: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    const options = [
      { value: 'user', label: this.$t('github.commitDialog.commitTreeOptions[0]') },
      { value: 'last', label: this.$t('github.commitDialog.commitTreeOptions[1]'), icon: 'schedule' },
      { value: 'validated', label: this.$t('github.commitDialog.commitTreeOptions[2]'), icon: 'verified' },
    ];
    const trees: { value: string; label: string } = options[0];
    return {
      message: '',
      trees,
      options,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username', 'avatar']),
  },
  methods: {
    commitChanges(userType: string) {
      const githubMessage = this.message + ': committed by ArboratorGrew';
      if (userType == 'user') userType = this.username;
      const data = { message: githubMessage, repositoryName: this.repositoryName, userType: userType };
      api
        .commitChanges(this.projectName, this.username, data)
        .then(() => {
          notifyMessage({ message: this.$t('github.commitDialog.commitMessage') + `"${this.repositoryName}"` });
          this.$emit('committed');
        })
        .catch((error) => {
          const errorMessage = error.response.data.message;
          notifyError({ error: `${errorMessage}` });
        });
    },
  },
});
</script>
<style></style>
