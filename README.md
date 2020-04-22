# arborator (arborator-frontend)

Frontend for arborator draft

## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
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
