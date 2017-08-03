/**
Copyright 2017 LGS Innovations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
(() => {
  'use strict';

  const ContactsManager = require('./lib/contacts/contacts-manager');
  const PhoneBookManager = require('./lib/phonebook/phonebook-manager');

  class App {
    constructor() {
      this._contactsManager = new ContactsManager();
      this._phoneBookManager = new PhoneBookManager(this._contactsManager);
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._contactsManager.load(messageCenter))
      .then(() => this._phoneBookManager.load(messageCenter));
    }

    unload(messageCenter) {
      return Promise.resolve()
      .then(() => this._phoneBookManager.unload(messageCenter))
      .then(() => this._contactsManager.unload(messageCenter));
    }
  }

  module.exports = new App();
})();
