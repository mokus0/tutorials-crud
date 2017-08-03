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

  const CrudManager = global.helper.CrudManager;

  class ContactsManager extends CrudManager {
    constructor() {
      super('contacts#Contacts', {readScopes: ['public'], writeScopes: ['public']});
    }

    validate(contact) {
      return super.validate(contact)
        .then(contact => {
          let phone = contact.phone;
          if(undefined === phone || null === phone) {
            return Promise.reject("Has no phone");
          }
          if('string' !== typeof(phone)) {
            return Promise.reject("Phone is not a string");
          }
          if(0 === phone.length) {
            return Promise.reject("Phone number cannot be an empty string");
          }
          return Promise.resolve(phone);
        });
    }
  }

  module.exports = ContactsManager;
})();
