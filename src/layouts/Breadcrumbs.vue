<template>
  <div class="row">
    <q-breadcrumbs
      :active-color="$q.dark.isActive ? 'white' : 'primary'"
      :class="($q.dark.isActive ? 'text-grey' : 'text-black') + ' mobile-hide native-mobile-hide within-iframe-hide gt-xs overflow-auto text-no-wrap'"
      :style="`max-height: ${height}; overflow: y; font-size: ${fontSize}px`"
    >
      <template v-slot:separator>
        <q-icon size="1.5em" name="chevron_right" color="primary" />
      </template>
      <q-breadcrumbs-el v-if="$route.path.startsWith('/projects')" icon="view_module" to="/projects" />
      <q-breadcrumbs-el
        v-if="$route.params.projectname"
        :label="$route.params.projectname"
        icon="fas fa-tree"
        :to="'/projects/' + $route.params.projectname"
      />
      <q-breadcrumbs-el
        v-if="$route.params.samplename && $route.params.projectname"
        :label="$route.params.samplename"
        icon="assignment"
        :to="'/projects/' + $route.params.projectname + '/' + $route.params.samplename"
      />
    </q-breadcrumbs>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  name: 'Breadcrumbs',
  props: {
    height: {
      type: Number as PropType<number>,
      required: true,
    },
    fontSize: {
      type: Number as PropType<number>,
      required: true,
    }
  }
})

</script>
