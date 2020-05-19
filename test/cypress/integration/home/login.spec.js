// import * as ctx from  '../../../../quasar.conf.js'


// describe('Login', () => {
//   it('Login through Google', () => {
//     const username = Cypress.env('')
//     const password = Cypress.env('')
//     const loginUrl = Cypress.env('https://accounts.google.com/signin/oauth/oauthchooseaccount?client_id=890198703708-7pn39h2nghq2l87s8psg7seaertta7k5.apps.googleusercontent.com&redirect_uri=https%3A%2F%2F127.0.0.1%3A5000%2Flogin%2Fgoogle%2F&scope=profile%20email&state=0c38cb3d7fcc6619fcc64248e9&response_type=code&o2v=1&as=A1aSkioOrFKzZMVef8qX-A&flowName=GeneralOAuthFlow')
//     const cookieName = Cypress.env('remember_token')
//     const socialLoginOptions = {
//       username,
//       password,
//       loginUrl,
//       headless: true,
//       logs: false,
//       loginSelector: 'a[href="/auth/auth0/google-oauth2"]',
//       postLoginSelector: '.account-panel'
// 	}
	
// 	cy.clearCookies()

// 	return cy.task('GoogleSocialLogin', socialLoginOptions).then(({cookies}) => {
// 		const cookie = cookies.filter(cookie => cookie.name === cookieName).pop()
// 		if (cookie) {
// 			cy.setCookie(cookie.name, cookie.value, {
// 			domain: cookie.domain,
// 			expiry: cookie.expires,
// 			httpOnly: cookie.httpOnly,
// 			path: cookie.path,
// 			secure: cookie.secure
// 			})

// 			Cypress.Cookies.defaults({
// 			whitelist: cookieName
// 			})
// 		}
// 	})
	
//     // return cy.task('GoogleSocialLogin', socialLoginOptions).then(({cookies}) => {
//     //   cy.clearCookies()
 
//     //   const cookie = cookies.filter(cookie => cookie.name === cookieName).pop()
//     //   if (cookie) {
//     //     cy.setCookie(cookie.name, cookie.value, {
//     //       domain: cookie.domain,
//     //       expiry: cookie.expires,
//     //       httpOnly: cookie.httpOnly,
//     //       path: cookie.path,
//     //       secure: cookie.secure
//     //     })
 
//     //     Cypress.Cookies.defaults({
//     //       whitelist: cookieName
//     //     })
//     //   }
//     // })
//   })
// })