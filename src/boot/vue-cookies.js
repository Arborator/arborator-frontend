import { boot } from 'quasar/wrappers'
import VueCookies, {VueCookiesManager} from "vue3-cookies";
var cookiesConfig =  {
  expireTimes: "7d",
}

var cookies = null

// const cookies = new VueCookiesManager()
// cookies.config(cookiesConfig)
// export const cookies = VueCookies(cookiesConfig)
export default boot(({ app }) => {
  app.use(VueCookies, cookiesConfig)
  cookies = app.config.globalProperties.$cookies ;
  console.log("KK coolies", cookies)
})
console.log("KK boot cookies", cookies)
export {cookies}