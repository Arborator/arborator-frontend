/**
  * @description              This is ui testing for KlangProject Page
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

import KlangProject from 'src/pages/KlangProject.vue'
import { API } from "src/boot/axios-adapters/axios-api";

import mocks from "test/jest/__mocks__/KlangProject.json";
import * as util from "test/jest/utils";

//This is to mock up axios get response
const projectname = 'khoaProject';
const data = mocks.UITesting.mockResponse;
const property = mocks.UITesting.mockProperty;
let mockAPI = new MockAdapter(API);

mockAPI.onGet(`klang/projects/${projectname}/samples`).reply(
    200, data.samples
);
mockAPI.onGet("users/").reply(200, data.users);

// Test suite for KlangProject component
describe('KlangProject.vue', () => {
    let localVue;
    let wrapper, vm;
    let testIndex = -1;

    beforeEach(() => {
        testIndex ++;
        localVue = createLocalVue();
        // Use mocked options for vue-il8n
        localVue.use(Storage, util.options);
        localVue.use(Vuex);
        localVue.use(VueRouter);
        const router = new VueRouter();

        wrapper = mount(KlangProject, {
            localVue,
            router,
            mocks: {
                $t: util.$t, 
                $tc: util.$tc, 
                $n: util.$n, 
                $d: util.$d
            },
            props: [
                'kprojectname'
            ],
            propsData: {
                kprojectname: projectname
            },
            computed: {
                admins: () => property[testIndex].admins,
                isSuperAdmin: () => property[testIndex].super_admin
            },
            provide: qLayoutInjections()
        });
        vm = wrapper.vm;
    })

    // running test cases
    // Test case 1
    // admins = [], super_admin = true
    it('should display the correct project list', async () => {
        // It will be waiting for 100 ms so that KlangProject component get 
        // sample list from the mocked server.
        await util.sleep(100);

        // wait for DOM to be updated
        await Vue.nextTick();
        
        // dom testing
        // check if all sample buttons are displayed correctly
        let index;
        for(index in data.samples) {
            // check if button for each samples exists
            const sample = data.samples[index];
            const sampleUrl = `#/klang/${projectname}/${sample}`;
            const button = wrapper.find(`a[href="${sampleUrl}"]`);
            expect(button.element).toBeTruthy();

            // check if button text is correct
            const textElement = button.find('span.block');
            const text = textElement.text();
            const expectedText = `${index}. ${sample}`;
            expect(text).toStrictEqual(expectedText);
        }
    });

    // Test case 2
    // admins = [], super_admin = true
    it('should display "add admins" button when superadmin is true', async () => {
        await util.sleep(100);
        await Vue.nextTick();
        
        // Find add admins button and check if exists
        const button = wrapper.findComponent({ ref: 'addAdmins' });
        expect(button.element).toBeTruthy();

        // Check if button text element exists
        const textWrapper = button.find('.block');
        expect(textWrapper.element).toBeTruthy();

        // Check if button text is correct
        const text = textWrapper.text();
        expect(text).toStrictEqual('Add admins for the project');
    });

    // Test case 3
    // admins = [], super_admin = false
    it(`shouldn't display "add admins" button when superadmin is false`, async () => {
        await util.sleep(100);
        await Vue.nextTick();
        
        // Check if "add admins" button doesn't exist
        const button = wrapper.findComponent({ ref: 'addAdmins' });
        expect(button.element).toBeFalsy();
    });

    // Test case 4
    // admins = [], super_admin = true
    it(`should send the selected admins to the server`, async() => {
        await util.sleep(100);
        await Vue.nextTick();
        
        // Clicks the "Add admins" button and wait for 100ms until
        //  the DOM gets updated
        const adminButton = wrapper.findComponent({ ref: 'addAdmins'});
        expect(adminButton.element).toBeTruthy();
        adminButton.trigger('click');
        await util.sleep(100);
        await Vue.nextTick();

        // Check if adminsDialog property is set to true
        expect(vm.adminsDialog).toBeTruthy();

        // Check if dialog is displayed
        const dialog = wrapper.findComponent({ ref: 'addAdminsDialog' });
        expect(dialog.element).toBeTruthy();
        
        // Check if user list is displayed
        const userList = wrapper.findComponent({ ref: 'userList' });
        expect(userList.element).toBeTruthy();
        
        // Check if user1's checkbox is displayed and clicks it
        // And also wait for 100ms until DOM gets updated
        const users = data.users;
        const user1 = userList.find(
            `div[aria-label="${users[1].username}"] input[type="checkbox"]`
        );
        expect(user1.element).toBeTruthy();
        user1.trigger('click');
        await util.sleep(100);
        
        // Check if user2's checkbox is displayed and clicks it
        // And also wait for 100ms until DOM gets updated
        const user2 = userList.find(
            `div[aria-label="${users[2].username}"] input[type="checkbox"]`
        );
        expect(user1.element).toBeTruthy();
        user2.trigger('click');
        await util.sleep(100);

        // This is a mocked request handler for setting admins
        mockAPI.onPost(`klang/projects/${projectname}/admins`).replyOnce(
            config => {
                // Check if correct data is sent from client
                const data = JSON.parse(config.data);
                const expectedData = [
                    users[1].username, 
                    users[2].username
                ];
                expect(data).toBe(expectedData)
                return [200];
            }
        )
        // check if "Select" button is displayed
        const okbutton  = wrapper.findComponent({ ref: 'OKButton' });
        expect(okbutton.element).toBeTruthy();
        // Clicks the butttn to send seleted admins to server
        okbutton.trigger('click');
    })
});