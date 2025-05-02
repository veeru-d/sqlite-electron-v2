# Using @capacitor-community/sqlite plugin in electron app with latest versions of ionic, angular and capacitor. With encryption and without it.
# ***`database is not a file` while opening encrypted sqlite data base***

## TLDR
`@capacitor-community/sqlite`:
- unencrypted database:
  - android - WORKS
  - electron - WORKS
- encrypted database:
  - android - WORKS
  - electron - ERROR `database is not a file`

## Info on the app
This is a **DEMO** app based on **latest** versions of `ionic, angular, capacitor` app with android and electron platforms. Uses latest `@capacitor-community/sqlite` plugin.</br></br>
I have another production app with **older** versions of `ionic, angular, capacitor` with android and electron platforms **working fine** with **encrypted** sqlite databases. Uses older verion of `@capacitor-community/sqlite` plugin.

## Added Electron platform
[Ref](https://github.com/capacitor-community/sqlite)

**`capacitor.config.ts:`**
```
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'sqlite-electron',
  webDir: 'www',
  plugins: {
    CapacitorSQLite: {
      electronIsEncryption: true,
      electronWindowsLocation: 'C:\\Users\\Public',
    },
  },
};

export default config;
```

```
npm i @capacitor-community/electron
npx cap add @capacitor-community/electron
npx cap sync @capacitor-community/electron
```

[Ref](https://github.com/capacitor-community/sqlite)
```
cd electron
npm install --save better-sqlite3-multiple-ciphers
npm install --save electron-json-storage
npm install --save jszip
npm install --save node-fetch@2.6.7
npm install --save crypto
npm install --save crypto-js
npm install --save-dev @types/better-sqlite3
npm install --save-dev @types/electron-json-storage
npm install --save-dev @types/crypto-js

npm install --save-dev electron@25.8.4
npm uninstall --save-dev electron-rebuild
npm install --save-dev @electron/rebuild
npm install --save-dev electron-builder@24.6.4
```

`electron/tsconfig.json`:
```
"skipLibCheck": true
```

Build app
```
cd <root>
npm run build --configuration=development
```

Run electron app in windows:
```
cd electron
npm run electron:start
```

**DOES NOT WORK**

```
ERROR Error: "CapacitorSQLite" plugin is not implemented on electron
    at B (chunk-XR2CIPKH.js:1:1374)
    at chunk-XR2CIPKH.js:1:1490
    at f.invoke (polyfills-4BK4MXU4.js:1:6511)
    at Object.onInvoke (chunk-DIB2G2IA.js:7:23687)
    at f.invoke (polyfills-4BK4MXU4.js:1:6451)
    at _.run (polyfills-4BK4MXU4.js:1:1767)
    at polyfills-4BK4MXU4.js:2:553
    at f.invokeTask (polyfills-4BK4MXU4.js:1:7136)
    at Object.onInvokeTask (chunk-DIB2G2IA.js:7:23503)
    at f.invokeTask (polyfills-4BK4MXU4.js:1:7057)
```

## fixing electron app
[Ref](https://github.com/capacitor-community/sqlite/issues/636#issuecomment-2830123873)</br>
Changed `electron/node_modules/@capacitor-community/sqlite/electron/dist/plugin.js`
```
CapacitorCommunitySqlite: CapacitorCommunitySqlite.default,
```

with this the following error was thrown
```
npm run electron:start
...
called ipcMain.handle: CapacitorSQLite-createConnection
&&& Databases path: C:\Users\Public\sqlite-electron\todoencSQLite.db
called ipcMain.handle: CapacitorSQLite-open
[32688:0428/125048.742:ERROR:crashpad_client_win.cc(844)] not connected
```

[Ref](https://github.com/capacitor-community/sqlite/issues/636#issuecomment-2837930986)</br>
Followed the above ref
- uninstalled `@electron/rebuild`
- installed `node-fetch@^2.7.0, electron@^26.6.10, electron-builder@^23.6.0, electron/rebuild@^3.2.9`

Also, the following changes are needed:
1. in `electron/node_modules/builder-util-runtime/out/httpExecutor.d.ts:`</br
change `[key: string]: string;` to `[key: string]: any;`

2. in `electron/node_modules/chokidar/types/index.d.ts`:</br>
add this after `close()`:
```
ref(): this;
unref(): this;
```

With this, I'm able to successfully build, run the electron app and create and read sqlite db **without** encryption

## encrypted database
Creating encrypted database is working fine.</br>
However, if I try to open an existing encrypted database, I get error:

```
cd <root>
npm run build --configuration=development
npx cap copy @capacitor-community/electron

cd electron
npm i
```

delete any dbs in `c:/users/public/sqlite-electron` and run electron app:
```
npm run electron:start
```

click "CREATE ENCRYPTED DATA" button</br>
cmd-line message (no error):
```
...
called ipcMain.handle: CapacitorSQLite-isSecretStored
called ipcMain.handle: CapacitorSQLite-createConnection
&&& Databases path: C:\Users\Public\sqlite-electron\todoencSQLite.db
called ipcMain.handle: CapacitorSQLite-open
called ipcMain.handle: CapacitorSQLite-execute
$$$ in executeSQL journal_mode: delete $$$
called ipcMain.handle: CapacitorSQLite-run
$$$ in runSQL journal_mode: delete $$$
called ipcMain.handle: CapacitorSQLite-close
called ipcMain.handle: CapacitorSQLite-closeConnection
```

Close the app and relaunch it (it's not needed, but to simulate an app that reads pre-populated encrypted db)
```
npm run electron:start
```

click "READ ENCRYPTED DATA" button</br>
**ERROR**</br>
cmd-line error:
```
...
called ipcMain.handle: CapacitorSQLite-isSecretStored
called ipcMain.handle: CapacitorSQLite-createConnection
&&& Databases path: C:\Users\Public\sqlite-electron\todoencSQLite.db
called ipcMain.handle: CapacitorSQLite-open
Error occurred in handler for 'CapacitorSQLite-open': Error: Open: Error: Open: Error: OpenOrCreateDatabase DbChanges:  file is not a database
    at CapacitorSQLite.open (D:\ezeescore\sqlite-electron-github-v2\sqlite-electron-v2\electron\node_modules\@capacitor-community\sqlite\electron\dist\plugin.js:5371:20)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async WebContents.<anonymous> (node:electron/js2c/browser_init:2:89579)
```

dev tools error in console tab:
```
ERROR Error: Error invoking remote method 'CapacitorSQLite-open': Error: Open: Error: Open: Error: OpenOrCreateDatabase DbChanges:  file is not a database
```

## Open the encrypted database
the encrypted db created above can be opened using `DB Browser (SQLCipher)` app without any issue</br>
And, it has the expected table & row. Need to provide passphrase to open the db but it works.
