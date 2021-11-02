import { boot } from 'quasar/wrappers'
import VueCookies from "vue3-cookies";
var cookiesConfig =  {
  expireTimes: "7d",
}

let cookies = null

export default boot(({ app }) => {
  app.use(VueCookies, cookiesConfig)
  cookies = app.config.globalProperties.$cookies ;
  console.log("Boot vue3-cookies", cookies)
})

export {cookies}