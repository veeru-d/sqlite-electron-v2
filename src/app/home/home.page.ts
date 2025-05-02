import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  unencryptedDbName = 'todounc';
  encryptedDbName = 'todoenc';
  passphrase = '1234567890';

  async createUnencryptedData() {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    console.log('createUnencryptedData: sqlite=', JSON.stringify(sqlite));

    ////////// Initialization
    const readOnly = false; // must be false to create a new db
    const db = await sqlite.createConnection(
      this.unencryptedDbName,
      false,
      'no-encryption',
      0,
      readOnly
    );
    console.log('createUnencryptedData: db=', JSON.stringify(db));

    await db.open();
    //////////

    ////////// create table and add row
    const createTable = await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      );`);
    console.log(
      'createUnencryptedData: createTable=',
      JSON.stringify(createTable)
    );

    const addTodo = await db.run(
      'INSERT INTO todos (title, completed) VALUES (?, ?);',
      [`test todo ${Math.round(Math.random() * 1000)}`, 0]
    );
    console.log('createUnencryptedData: addTodo=', JSON.stringify(addTodo));
    //////////

    ////////// cleanup
    await db.close();
    await sqlite.closeConnection(this.unencryptedDbName, readOnly);
    //////////
  }

  async readUnencryptedData() {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    console.log('readUnencryptedData: sqlite=', JSON.stringify(sqlite));

    ////////// Initialization
    const readOnly = true; // must be true to access an existing db
    const db = await sqlite.createConnection(
      this.unencryptedDbName,
      false,
      'no-encryption',
      0,
      readOnly
    );
    console.log('readUnencryptedData: db=', JSON.stringify(db));

    await db.open();
    //////////

    ////////// read rows
    const query = 'SELECT * FROM todos;';
    const result = await db.query(query);
    console.log(
      'readUnencryptedData: query result=',
      JSON.stringify(result.values)
    );
    //////////

    ////////// cleanup
    await db.close();
    await sqlite.closeConnection(this.unencryptedDbName, readOnly);
    //////////
  }

  async createEncryptedData() {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    console.log('createEncryptedData: sqlite=', JSON.stringify(sqlite));

    const { result: isSecretStored } = await CapacitorSQLite.isSecretStored();
    console.log('createEncryptedData: isSecretStored=', isSecretStored);

    if (!isSecretStored) {
      await CapacitorSQLite.setEncryptionSecret({
        passphrase: this.passphrase,
      });
      console.log('createEncryptedData: set encryption secret successfully');
    }

    ////////// Initialization
    const readOnly = false; // must be false to create a new db
    const db = await sqlite.createConnection(
      this.encryptedDbName,
      true,
      'secret',
      0,
      readOnly
    );
    console.log('createEncryptedData: db=', JSON.stringify(db));

    await db.open();
    //////////

    ////////// create table and add row
    const createTable = await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      );`);
    console.log(
      'createEncryptedData: createTable=',
      JSON.stringify(createTable)
    );

    const addTodo = await db.run(
      'INSERT INTO todos (title, completed) VALUES (?, ?);',
      [`test todo ${Math.round(Math.random() * 1000)}`, 0]
    );
    console.log('createEncryptedData: addTodo=', JSON.stringify(addTodo));
    //////////

    ////////// cleanup
    await db.close();
    await sqlite.closeConnection(this.encryptedDbName, readOnly);
    //////////
  }

  async readEncryptedData() {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    console.log('readEncryptedData: sqlite=', JSON.stringify(sqlite));

    const { result: isSecretStored } = await CapacitorSQLite.isSecretStored();
    console.log('readEncryptedData: isSecretStored=', isSecretStored);

    if (!isSecretStored) {
      await CapacitorSQLite.setEncryptionSecret({
        passphrase: this.passphrase,
      });
      console.log('readEncryptedData: set encryption secret successfully');
    }

    ////////// Initialization
    const readOnly = true; // must be true to access an existing db
    const db = await sqlite.createConnection(
      this.encryptedDbName,
      true,
      'secret',
      0,
      readOnly
    );
    console.log('readEncryptedData: db=', JSON.stringify(db));

    await db.open();
    //////////

    ////////// read rows
    const query = 'SELECT * FROM todos;';
    const result = await db.query(query);
    console.log(
      'readEncryptedData: query result=',
      JSON.stringify(result.values)
    );
    //////////

    ////////// cleanup
    await db.close();
    await sqlite.closeConnection(this.encryptedDbName, readOnly);
    //////////
  }
}
