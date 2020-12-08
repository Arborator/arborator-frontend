/**
  * @description              This is ui testing for Klang Page
  * @version                  1.0
  * @author                   Gerdes
  * @createdBy                Khoa
  * @since                    06-12-2020
  */

import { createLocalVue, mount } from "@vue/test-utils";
import Storage from "vue-ls";
import Vue from "vue";
import Vuex from "vuex";
import VueRouter from 'vue-router';
import MockAdapter from "axios-mock-adapter";

import { 
    qLayoutInjections 
} from "@quasar/quasar-app-extension-testing-unit-jest";

import Klang from 'src/pages/Klang.vue'
import store from "src/store/index.js";
import { API } from "src/boot/axios-adapters/axios-api";

import mocks from "test/jest/__mocks__/Klang.json";
import * as util from "test/jest/utils";

//This is to mock up axios get response
var mock_api = new MockAdapter(API);
const data = mocks.UITesting.mockResponse;
mock_api.onGet("klang/projects").reply(200, data);

describe('Klang.vue', () => {
    const localVue = createLocalVue();
    localVue.use(Storage, util.options);
    localVue.use(Vuex);
    localVue.use(VueRouter);
    const router = new VueRouter();
    
    const wrapper = mount(Klang, {
        store,
        localVue,
        router,
        mocks: {
           $t: util.$t, 
           $tc: util.$tc, 
           $n: util.$n, 
           $d: util.$d
        },
        provide: qLayoutInjections()
    });
    const vm = wrapper.vm;

    // running test cases
    it('should display the correct project list', async () => {
        // It will be waiting for 100 ms so that Klang component get 
        // project list from the mocked server.
        await util.sleep(100);

        // wait for DOM to be updated
        await Vue.nextTick();
        
        // dom testing
        let index;
        for(index in data) {
            const projectName = data[index];
            
            // check if project button exists
            const projectUrl = '#/klang/' + projectName;
            const button = wrapper.find(`a[href="${projectUrl}"]`);
            expect(button.element).toBeTruthy();

            // check if text element exists
            const textWrapper = button.find('span.block');
            expect(textWrapper.element).toBeTruthy();

            // check if text is correct
            const text = textWrapper.text();
            const expectedText = index + '. ' + projectName;
            expect(text).toEqual(expectedText);
        }
    })
});