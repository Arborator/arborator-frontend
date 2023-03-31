<q-tab-panel name="create">
                <div class="text-h6 text-left">Create new repository</div>
                <q-form class="q-gutter-md" @submit="createGithubRepository">
                    <q-input
                        filled
                        v-model="name"
                        label="Repository Name*"
                        :rules="[
                            (val) => (val && val.length > 0) || 'Please type something',
                            (val) => (!existRepositoryName(val)) || 'Repository name exists already',
                        ]"
                    />   
                    <q-input filled v-model="description" label="Description" />
                    <q-list>
                        <q-item>
                            <q-item-section style="text-align:left;">
                                <q-item-label>Visibility</q-item-label>
                                <q-item-label caption>Choose the visibility of your Github Repository.</q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                                <q-btn-toggle
                                    v-model="visibility"
                                    label="Visibility"
                                    :options="[
                                        { label: 'Private', value:'private' },
                                        { label: 'Public', value: 'public' },

                                    ]"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <q-btn color="primary" :disable="name == '' || visibility == ''" type="submit">Create new repository</q-btn>
                </q-form>
            </q-tab-panel>


            createGithubRepository(){
            const data = {repositoryName: this.name, description: this.description, visibility: this.visibility};
            api
              .createGithubRepository(this.projectName as string, this.username, data)
              .then((response) => {
                notifyMessage({message: `New Github repository is created`})
                this.$emit('synchronized')
              })
              .catch((error) => {
                notifyError({error})
              })
        }