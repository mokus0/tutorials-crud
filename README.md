BITS "CRUD" Tutorial
---
This tutorial shows how to use the CRUD helpers in the BITS stack.

- [Objective](#objective)
- [Before You Begin](#before-you-begin)
- [Introduction: Intro to Crud+o](#introduction)
- [Step 1: Creating a Crud Subsystem](#step-2)
- [Step 2: Adding elements to the crud subsystem](#step-2)
- [Step 3: Getting a CRUD list in the UI](#step-3)
- [Step 4: Binding to a CRUD list in the UI](#step-4)
- [Step 5: Adding Validation](#step-5)

# <a name="objective"></a> Objective
- General understanding of the CRUD helpers.
- Create a CRUD Subsystem.
- Creating/Update/Delete data from the server.
- Creating/Updating/Deleting data from the client
- Subscribing to events.

# <a name="before-you-begin"></a> Before You Begin
You need to setup a BITS Base, and be able to communicate with a running instance. If you do not already have a BITS Base running, you can create one by downloading the source and using the development command-line. You should also have a good understanding of how modules are loaded in BITS as well as how to use the message center to add requests and add Listeners.

# <a name="introduction"></a> Intro to Crud+o
CRUD is an acronym that relates to persistent storage. Many databases follow this acronym as well many ram backed technologies. In BITS. The base provides helper classes that implement the CRUD API. Crud stands for Create Read Update and Delete. The +o has been added recently to also allow for subscribing to changes. In BITS we use CRUD to maintain a list of objects across all modules that need access to that data. The bits crud api implements 6 methods: `create`, `update`, `delete`, `get`, `list`, and `count`. In addition to the api. The subsystem also emits 3 events. `created`, `updated`, and `deleted`.

# <a name="step-1"></a> Step 1: Intro to Crud+o
For the first tutorial we are going to build a contacts app that stores contacts in ram. First create a contacts subsystem under the lib directory and create a contacts manager that inherits from the CrudManager. His code should look like:
``` javascript
(() => {
  'use strict';

  const CrudManager = global.helper.CrudManager;

  class ContactsManager extends CrudManager {
    constructor() {
      super('contacts#Contacts', {readScopes: ['public'], writeScopes: ['public']});
    }
  }

  module.exports = ContactsManager;
})();
```
There are several notable pieces here.
1. The super class can be found in global.helper.CrudManager.
2. The first parameter is the tag that the manager can use to send events across the message center. We usually prefix with module#Subsystem.
3. The next parameter is options for the message center. We are allowing anybody to be able to edit this data by setting writeScopes as public.

The next step is to then get the index.js to load this subsystem during its load process and unload it during unload. The modules index.js should look like:
``` javascript
(() => {
  'use strict';

  const ContactsManager = require('./lib/contacts/contacts-manager');

  class App {
    constructor() {
      this._contactsManager = new ContactsManager(this);
    }
    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._contactsManager.load(messageCenter));
    }

    unload() {
      return Promise.resolve()
      .then(() => this._contactsManager.unload(messageCenter));
    }
  }

  module.exports = new App();
})();

```

Now you can run your module and the contacts subsystem will load. The CRUD Manager super class sets up a messenger as well as an API class for you.

# <a name="step-2"></a> Adding Elements to the Crud Subsystem
In this step we are going to show you how to interact with the manager to interact with the internal data. The first step is to create another subsystem that will use the contacts subsystem to manage its data. Lets call this subsystem the phone book. Create a phone book manager that looks like:

``` javascript

(() => {
  'use strict';

  class PhonebookManager{
    constructor(contactsManager) {
      this._contactsManager = contactsManager;
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._contactsManager.create({
        name: 'User',
        phone: '867-5309'
      }))
      .then((entry) => {
        console.log('The entry', entry);
      })
      .then(() => this._contactsManager.list())
      .then((listResult) => {
        console.log('ListResult', listResult);
      });
    }
  }

  module.exports = PhonebookManager;
})();
```

Then add the manager to the index.js so the module loads it.
``` javascript
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
```

After running the module you should see the following output.

```
The entry { name: 'User', phone: '867-5309', id: 0 }
ListResult [ { name: 'User', phone: '867-5309', id: 0 } ]
```

The entry gets printed as the value that is stored in the list. You can see that an id field was added to the object. This allows you to reference this particular object later. For example to update this entry you could run.

``` javascript
update() =>  {
  return Promise.resolve()
  .then(() => this._contactsManager.create({
    name: 'User',
    phone: '867-5309'
  }))
  .then((entry) => {
    this._id = entry.id;
  })
  .then(() => this._contactsManager.update(this._id, {phone: '555-5555'}));
}
```
This code changes the created users phone number. Before continuing make sure you understand the above output and how it is working.

# <a name="step-3"></a> Step 3: Getting CRUD list in the UI
The next step is to then see this data in the UI.

First create a helper element called tutorial-contacts.html. It should look like:

``` html
<link rel="import" href="../../bower_components/polymer/polymer.html">
<link rel="import" href="../base-crud/base-crud-behavior.html">

<script>
((global) => {
  'use strict';

  Polymer({
    is: 'tutorials-contacts',

    behaviors: [
      global.Bits.BaseCrudBehavior
    ],

    properties: {
      tag: {
        value: 'contacts#Contacts'
      }
    }
  });
})(this);
</script>

```

The tag field here needs to match the tag that you gave the crud manager when you created the contacts crud manager. Next we want to add this element to the page in the UI that needs the data. We are going to add the tag to the tutorials-crud-app page. It should look like:

``` html
<link rel="import" href="../../bower_components/polymer/polymer.html">
<link rel="import" href="../tutorials-contacts/tutorials-contacts.html">

<dom-module id="tutorials-crud-app">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>
    <tutorials-contacts id="contacts"></tutorials-contacts>
  </template>
  <script>
  (() => {
    'use strict';

    Polymer({
      is: 'tutorials-crud-app',

      ready: function() {
        return this.$.contacts.list()
        .then((contacts) => {
          console.log('Contacts', contacts);
        });
      }
    });
  })();
  </script>
</dom-module>

```

After loading this module navigate to the app, the page will still be blank but right click on the page and click inspect. This will take you to the developer window. On the developer window click console and you should see your UI logs. You should see a log that says Contacts with a list of length one. This is the contacts list. Before continuing ensure you understand what this log is and why its showing the data it is.

# <a name="step-4"></a> Step 4: Binding to a CRUD list in the UI
Instead of always having to manually call methods such as `list`, `count`, and `get` we are able to databind to the items property to get a full updating list from the server. We are going to modify the tutorial-crud-app to bind to the data object instead of manually calling list.

``` html
<link rel="import" href="../../bower_components/polymer/polymer.html">
<link rel="import" href="../tutorials-contacts/tutorials-contacts.html">

<dom-module id="tutorials-crud-app">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>
    <tutorials-contacts id="contacts" items="{{contacts}}"></tutorials-contacts>
  </template>
  <script>
  (() => {
    'use strict';

    Polymer({
      is: 'tutorials-crud-app',
      properties: {
        contacts: {
          type:Array,
          observer: 'contactsChanged'
        }
      }

      contactsChanged: function(value) {
        console.log('Contacts Updated', value);
      }

    });
  })();
  </script>
</dom-module>
```

Reloading the page you should see very similar output as before but instead of just reading the contacts once we will see that list update anytime there is a change on the server. The next step is to create a list so we can see the contacts list. To do this we are going to use a vaadin grid. Modify your tutorial-crud-app.html to use a vaadin grid.

```html
<link rel="import" href="../../bower_components/polymer/polymer.html">
<link rel="import" href="../tutorials-contacts/tutorials-contacts.html">
<link rel="import" href="../../bower_components/vaadin-grid/vaadin-grid.html">

<dom-module id="tutorials-crud-app">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>
    <tutorials-contacts id="contacts" items="{{contacts}}"></tutorials-contacts>

    <vaadin-grid id="grid" items="[[contacts]]">
      <vaadin-grid-column>
        <template class="header">Name</template>
        <template>
          <div class="body-content" data-index$="[[index]]">[[item.name]]</div>
        </template>
      </vaadin-grid-column>

      <vaadin-grid-column>
        <template class="header">Number</template>
        <template>
          <div class="body-content" data-index$="[[index]]">[[item.phone]]</div>
        </template>
      </vaadin-grid-column>
    </vaadin-grid>

  </template>
  <script>
  (() => {
    'use strict';

    Polymer({
      is: 'tutorials-crud-app',
      properties: {
        contacts: {
          type:Array,
        }
      },

    });
  })();
  </script>
</dom-module>
```

Now refresh the page to see the grid. Your grid should have one entry that is a name and a phone number. Now we are going to make the list update. Normally this would be done from interaction with the user however, for the purposes of the demo we are going to do it on a timer. Modify the phonebook manager to look like:

``` javascript
(() => {
  'use strict';

  class PhonebookManager{
    constructor(contactsManager) {
      this._contactsManager = contactsManager;
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._contactsManager.create({
        name: 'User',
        phone: '867-5309'
      }))
      .then(() => {
        this._timeout = setTimeout(() => {
          this._contactsManager.create({
            name: 'Charlie',
            phone: '555-555-5555'
          });
        }, 15000);
      });
    }

    unload(messageCenter) {
      return Promise.resolve()
      .then(() => {
        clearTimeout(this._timeout);
      });
    }
  }

  module.exports = PhonebookManager;
})();

```
Start the app and navigate to the page. You should see a list with one contact. After 10 seconds the list should update with a new entry.


# <a name="step-5"></a> Step 5: Adding Validation

Data is often only useful if it follows a certain format. To help users manage this, BITS CRUD provides validation functionality. This functionality, like many things in BITS, is promise-based. This step will walk you through adding basic validation to the CRUD app.

Validation is performed in the `validate` method of a crud manager.
Let's use it to make sure our phone numbers are valid phone numbers.
Modify your contacts manager to look like this:

```javascript

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

```

As you can see, the `validate` method is called with a potential contact.
Within validations, you should always call `super.validate` first, so it can perform some basic checks.
Then, you can use the returned promise to do your own validation.

If validation fails, the promise returned by `create` will log an error.
This works client-side, but we'll test it server-side for now.
Open your phonebook manager and modify it to read as follows:

```javascript
(() => {
  'use strict';

  class PhonebookManager{
    constructor(contactsManager) {
      this._contactsManager = contactsManager;
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._contactsManager.create({
        name: 'User',
        phone: '867-5309'
      }))
      .then(() => {
        this._timeout = setTimeout(() => {
          this._contactsManager.create({
            name: 'Charlie',
            phone: '555-555-5555'
          });
        }, 15000);
      })
      .then(() => {
        this._contactsManager.create({
          name: "Mike",
          phone: null
        }).catch(err => console.log("--- Create got error: ", err));
        return Promise.resolve();
      });
    }

    unload(messageCenter) {
      return Promise.resolve()
      .then(() => {
        clearTimeout(this._timeout);
      });
    }
  }

  module.exports = PhonebookManager;
})();
```

When you restart BITS, you should see the message "Create got error: Has no phone" logged to the console.

You can perform any validations you want in the validate method, including ones which hit the network, as validations are promise-based.
Until the promise returns, the new record will not be added.
