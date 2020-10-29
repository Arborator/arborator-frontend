/**
 * @description             This is ui-testing for ProjectsHub component 
 * @version                 1.0
 * @author                  Gerdes
 * @createdBy               Khoa
 */

import { mount, createLocalVue } from "@vue/test-utils";
import Storage from "vue-ls";
import Vue from "vue";
import Vuex from "vuex";
import * as All from "quasar";
import { qLayoutInjections } from "@quasar/quasar-app-extension-testing-unit-jest";
import MockAdapter from "axios-mock-adapter";


// Thease are to import source components
import ProjectsHub from "src/pages/ProjectsHub.vue";
import ProjectCard from "src/components/ProjectCard.vue";

// This is to import store
import store from "src/store/index.js";

// This is to import mock data
import mocks from "test/jest/__mocks__/ProjectsHub.json";

// This is to import some utility functions
import * as util from "test/jest/utils";

// This is the axios instance which we are gonna mock
import { API } from "src/boot/axios-adapters/axios-api";

// These are to import all Quasar Components
const { Quasar, Notify, Cookies, Dialog } = All;
const components = Object.keys(All).reduce((object, key) => {
  const val = All[key]
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {})
Vue.use(Quasar, { components, plugins: { Notify, Cookies, Dialog }});

// This is to mock up vue-il8n
const options = { namespace: "arboratorgrew__", name: "ls", storage: "local" };
const $t = jest.fn();
const $tc = jest.fn();
const $n = jest.fn();
const $d = jest.fn();
$t.mockReturnValue("");

//This is to mock up axios get response
var mock_api = new MockAdapter(API);
const data = mocks.ui_testing.response_mock;
mock_api.onGet("projects").reply(200, data);

// testing cases
describe("Mount ProjectsHub component", () => {
    const localVue = createLocalVue()
    localVue.use(Storage, options);
    localVue.use(Vuex);
    const wrapper = mount(ProjectsHub, {
        store,
        localVue,
        mocks: {
           $t, $tc, $n, $d
        },
        provide: qLayoutInjections()
    })

    const vm = wrapper.vm

    // tseting case running
    it("is for DOM testing about Project Hub", async () => {
        // It will be waiting for 100 ms so that ProjectsHub component get project list from the mocked server.
        await util.sleep(100);

        // wait for DOM to be updated
        await Vue.nextTick();

        // just, start testing for DOM (projectHub & projectCard)
        // If timeout is over 100 ms then it must be occured for issue.
        // it sounds data didn't load form the API server.

        // see if project card compoent has been loaded successfully
        expect(wrapper.findComponent(ProjectCard).exists()).toBeTruthy();

        // see if project name is displayed correctly
        const project_name_selector = "div.absolute-bottom.text-h6";
        const project_name = wrapper.find(project_name_selector).text();
        expect(project_name).toContain(data[0].project_name);

        // see if project description is displayed correctly
        const project_description_selector = ".q-item .q-item__label";
        const project_description = wrapper.find(project_description_selector).text()
        expect(project_description).toStrictEqual(data[0].description);

        // see if number of samples is displayed correctly
        const number_samples_selector = ".q-badge.flex.inline.items-center.no-wrap.q-badge--single-line.bg-secondary";
        const number_samples = wrapper.find(number_samples_selector).text();
        expect(number_samples).toEqual(data[0].number_samples + "")
    })
})