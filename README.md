# arborator (arborator-frontend)

Here is the running application: https://arborator.grew.fr/

Don't hesitate to create an account to try it out.

## Documentation

Arborator-Grew's documentation is available here:
https://arborator.github.io/arborator-documentation/#/

## Important external docs

- Grew server documentation : https://grew.fr/usage/grew_server
- [DependencyTreeJS](https://github.com/kirianguiller/DependencyTreeJS) : For handling interactive dependency trees in the browser in JS
- [Conllup-js](https://github.com/kirianguiller/conllup-js) package : For handling conll format

## Install

We use docker to run the application. So you need to install docker on your machine. Here the install process on ubuntu

### 1. Install Docker and Docker Compose

```bash
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo apt-get install docker-compose
```

### 2. run container with docker-compose (`--build` is useful the first time of running it, and each time after a change of config inside the `Dockerfile`)

```
docker-compose up --build
```

The configuration do the following important things :

- builds the image from the `Dockerfile` defined in this repo
- runs the container with the name `arborator-frontend`
- exposes the port 8080 for local development
- allows hot reloading (by binding volumes)

## Auto Completion

You will need to install the nodes_modules locally if you want your code editor to have insights of the codebase for auto completion. So you need a working and compatible version of NPM ([link here](https://github.com/nvm-sh/nvm)). To do so, we highly recommend to install it through NVM.
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

### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
