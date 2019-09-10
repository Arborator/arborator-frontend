<template>
    <q-item clickable>
        <q-item-section avatar>
          <q-avatar rounded color="primary" text-color="white" icon="next_week">
         </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label lines="1"><span class="text-weight-bold">{{project.name}}</span></q-item-label>
            <q-item-label caption lines="2">
                {{project.description}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-icon v-show="project.is_private" name="lock" color="negative"></q-icon>
            <q-icon v-show="!project.is_private" name="lock_open" color="positive"></q-icon>
        </q-item-section>
    </q-item> 
</template>

<script>
export default {
    props: ['props'],
    data() {
        return {
            project: this.props
        }
    }
}
</script>

<style scoped>

</style>