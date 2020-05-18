import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
// ../../../src/
import App from "../../../src/App.vue"
import VueRouter from "vue-router"
import Index from "../../../src/pages/Index.vue"
import ProjectsHub from "../../../src/pages/ProjectsHub.vue"
import AppLayout from "layouts/AppLayout.vue"
import routes from "../../../src/router/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))

describe("App", () => {
  it("renders a child component via routing", () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, { localVue, router })

    router.push("/projects")

    expect(wrapper.find(ProjectsHub).exists()).toBe(true)
  })
})