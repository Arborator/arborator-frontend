# arborator (arborator-frontend)

Frontend for arborator draft

## Install the dependencies
```bash
npm install
sudo npm install -g @quasar/cli
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Test the interface

(may be necessary to do ```npm install``` first)

```bash
npm run test:e2e
```


### Build the app for production
```bash
quasar build
```

### Deploy a New Version

1.  Connect as Arborator (ssh arborator@arborapi.xxx.fr), then:
```
cd arborator-frontend
git pull origin master
rm -R dist
quasar build
```

2. Connect as root (ssh root@arborapi.xxx.fr), then:
```
service nginx restart
```

3. Profit. (Clean your browser cache if necessary to see the new version)

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).


## Test the components

### 1. Unit Testing

 Before you run the api testing files you have to run the following command
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
# It's for communcation with local https server on Linux OS
```
You can use npm scripts to run your testing files
```bash
npm run test:unit # run all your testing files (*.spec.js or *.test.js, etc)
npm run test:unit:coverage # also collect coverage status of your project
npm run test:unit:watch # automatically detect changes and run test again if changed
npm run test:unit:watchAll # run all tests if changed
```
If you wanna run only one testing file, then run as the following
```bash
npm run test:unit:watch test/jest/__tests__/some_test.js
```
You can also run jest commands directly

```bash
jest --watch --coverage
```

If you get the following error when you executed the this command `
npm run test:unit:watchAll`

`Error:ENOSPC: System limit for number of file watchers reached`

then please run the following command and try again
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```