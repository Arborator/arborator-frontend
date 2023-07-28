import { defineStore } from "pinia";

export const useGithubStore = defineStore('GithubStore', {
    state: () =>{
        return{
            reloadCommits: 0,
        }
    }

});