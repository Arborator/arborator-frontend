# arborator (arborator-frontend)

Here is the running application: https://arboratorgrew.elizia.net/

Don't hesitate to create an account to try it out

## Wiki (work in progress)

Arborator-Grew's wiki is available here: https://github.com/Arborator/arborator-frontend/wiki

This wiki will contain the full User Guide, which is currently a work-in-progress.

## Important external docs
- Grew server documentation : https://grew.fr/usage/grew_server
- [DependencyTreeJS](https://github.com/kirianguiller/DependencyTreeJS) : For handling interactive dependency trees in the browser in JS  
- [Conllup-js](https://github.com/kirianguiller/conllup-js) package : For handling conll format

## Install NVM
For either prod or dev, you need a working and compatible version of NPM ([link here](https://github.com/nvm-sh/nvm)). To do so, we highly recommend to install it through NVM.

Here the install process on ubuntu 

> For the Windows users, you have to use WSL1 [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

source ~/.bashrc # reload bashrc

nvm install 16.14.2
nvm alias default 16.14.2
```

WE HIGHLY RECOMMEND TO USE THE VERSION 16.14.2 !!

## Deploy a New Version on prod

Connect as Arborator (ssh arborator@elixxxx.xx) (ask sysadmin for the correct url), then:

```
cd arborator-frontend
git pull origin master
npm run buildProd
```

## Local Development

### Install the dependencies

```bash
npm install
```
### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run start
```

### Test the interface

```bash
npm run test:e2e
```

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

If you get the following error when you executed the this command ` npm run test:unit:watchAll`

`Error:ENOSPC: System limit for number of file watchers reached`

then please run the following command and try again

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```



### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

