<template>
  <q-dialog v-model="creatDialog" transition-show="fade" transition-hide="fade" persistent>
    <q-card style="min-width: 50vw;">
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn @click="closeDialog" flat dense icon="close" />
      </q-bar>
      <div v-if="loggedWithGithub">
        <q-linear-progress size="10px" :value="progress" color="primary" />
      </div>
      <q-card-section>
        <div class="text-h6 text-left">{{$t('createProjectCard.title')}}</div>
      </q-card-section>
      <q-card-section v-if="!isShowSyncBtn && !isShowGithubSyncPanel" style="min-height: 20vw;">
        <q-form id="createprojectform" class="q-gutter-md" @submit="onSubmit">
          <q-input
            id="projectnameinput"
            v-model="project.projectName"
            filled
            :label="$t('createProjectCard.projectName')"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || $t('createProjectCard.inputWarning')]"
          />
          <q-input id="descriptioninput" v-model="project.description" filled label="Description" />
          <q-separator />
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-radio v-model="project.visibility" :val="2"/>
              </q-item-section>
              <q-item-section side avatar>
               <q-icon size="md" name="o_groups" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{$t('createProjectCard.visibilityMode[2]')}}</q-item-label>
                <q-item-label caption>
                  {{ $t('projectSettings.togglePrivateCaption[2]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-radio v-model="project.visibility" :val="1"/>
              </q-item-section>
              <q-item-section side avatar>
               <q-icon size="md" name="o_visibility" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{$t('createProjectCard.visibilityMode[1]')}}</q-item-label>
                <q-item-label caption>
                  {{ $t('projectSettings.togglePrivateCaption[1]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-radio v-model="project.visibility" :val="0"/>
              </q-item-section>
              <q-item-section side avatar>
               <q-icon size="md" name="o_lock" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('createProjectCard.visibilityMode[0]') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('projectSettings.togglePrivateCaption[0]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator />
          <div class="text-h6 text-left">
            Corpus configuration
          </div>
          <div class="row q-gutter-md">
            <div class="col">
              <q-select
                style="text-transform: capitalize"
                v-model="project.language"
                filled
                :options="[]"
                stack-label
                label="Language"
              />
            </div>
            <div class="col">
              <q-select
                v-model="project.config"
                filled
                :options="annotationConfigOptions"
                stack-label
                emit-value
                label="Annotation settings"
              />
            </div>
          </div>
          <q-separator />
          <div class="row">
            <div class="col-md-7 text-h6">
                Annotation mode
            </div>
            <div class="col-md-1 offset-md-4">
                <q-btn outline round size="sm" color="primary" icon="question_mark"
                    href="https://arborator.github.io/arborator-documentation/#/?id=exercise-mode"
                    target="_blank">
                    <q-tooltip content-class="text-white bg-primary"> Assistance </q-tooltip>
                </q-btn>
            </div>
          </div>
          <q-list>
            <q-item>
              <q-item-section side top>
                <q-checkbox v-model="project.exerciseMode" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Blind Annotation</q-item-label>
                <q-item-label caption>
                 In this case the annotators will not be able to see others' trees
                </q-item-label>
              </q-item-section>
            </q-item>
            
          </q-list>
          <div class="row q-gutter-md justify-center">
            <q-btn :disable="project.projectName == ''" id="submitproject" type="submit" :label="$t('createProjectCard.create')" color="primary" />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section v-if="canSyncWithGithub" class="row justify-center q-gutter-md">
        <q-btn @click="isShowGithubSyncPanel = true, progress= 0.8" :label="$t('github.synchronizeBtn')" color="primary" class="items-center"/> 
      </q-card-section>
      <q-card-section v-if="canSyncWithGithub">
        <div class="row justify-center q-gutter-md clickable" v-close-popup>{{$t('github.skipSync')}}</div>
      </q-card-section>
      <GithubSyncDialog v-if="isShowGithubSyncPanel" :projectName="project.projectName"  @created="reloadAfterSync"/>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import GithubSyncDialog from '../components/github/GithubSyncDialog.vue';
import { useProjectStore } from 'src/pinia/modules/project';
import api from '../api/backend-api';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { mapActions, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: {
    GithubSyncDialog,
  },
  name:'CreaProjectCard',
  emits: ['created'],
  props: {
    parentGetProjects: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  data() {
    const annotationConfigOptions = [
      { value: 'sud', label: 'SUD'}, 
      { value: 'ud', label: 'UD'},
      { value: 'other', label:'Other'}
    ];
    return {
      submitting: false,
      project: {
        projectName: '',
        description: '',
        visibility: 2,
        language: '', 
        config: '',
        exerciseMode: false,
      },
      creatDialog: true,
      progress: 0,
      isShowSyncBtn: false,
      isShowGithubSyncPanel: false,
      synchronized:'',
      annotationConfigOptions,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username', 'loggedWithGithub', 'isSuperAdmin']),
    canSyncWithGithub(){
      return  this.loggedWithGithub && this.isShowSyncBtn && !this.isShowGithubSyncPanel; 
    }
  },
  methods: {
    ...mapActions(useProjectStore, ['resetAnnotationFeatures']),
    onSubmit() {
      this.submitting = true;
      this.resetAnnotationFeatures();
      const data = {
        ...this.project,
        username: this.username,
      };
      api
        .createProject(data)
        .then(() => {
          this.parentGetProjects();
          this.submitting = false;
          if (this.loggedWithGithub && !this.project.exerciseMode) {
            this.progress = 0.4;
            this.isShowSyncBtn = true;
          }
          else {
           this.closeDialog();
          }
          notifyMessage({
           message: `${this.project.projectName} ${this.$t('createProjectCard.createMessage')}`,
          });
        })
        .catch((error) => {
          notifyError({ error });
          this.submitting = false;
        });
    },
    reloadAfterSync() {
      this.progress = 1;
      this.creatDialog = false;
      this.parentGetProjects();
      this.$emit('created');
    },

    closeDialog() {
       this.creatDialog = false;
       this.$emit('created');
    }

  },
});
</script>
<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
  color: blue;
}
</style>
