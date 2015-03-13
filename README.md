# Route Migration

When we released the version 1.0.0 of our [`mmRoute` module][mmroute], we also changed the structure.
This repository contains a script for migrating old route structures to the new one required by `mmRoute`.

## Usage

The route definitions used by the old version of `mmRoute` looked like this:
```js
var routes = {
  admin: {
    profile: {
      view: {
        url: '/admin-profile',
        templateUrl: '/templates/admin-profile.html'
      },
      edit: {
        url: '/profile/:userId/edit',
        templateUrl: 'templates/edit-profile.html'
      }
    }
  },
  user: {
    signup: {
      url: '/signup',
      templateUrl: '/templates/signup.html'
    },
    profile: {
      view: {
        url: '/profile',
        templateUrl: '/templates/user-profile.html'
      }
    }
  }
};
```

The new structure that this script will migrate your routes to looks like this:
```js
var routes = {
  profile: {
    view: {
      url: '/profile',
      access: [
        {
          view: {
            templateUrl: '/templates/user-profile.html'
          },
          roles: [
            'ADMIN'
          ]
        },
        {
          view: {
            templateUrl: '/templates/user-profile.html'
          },
          roles: [
            'USER'
          ]
        }
      ]
    },
    edit: {
      url: '/profile/:userId/edit',
      access: [
        {
          view: {
            templateUrl: '/templates/edit-profile.html'
          },
          roles: [
            'ADMIN'
          ]
        }
      ]
    }
  },
  signup: {
    url: '/signup',
    access: [
      {
        view: {
          templateUrl: '/signup/'
        },
        roles:[
          'USER'
        ]
      }
    ]
  }
}
```

The script takes the path of the file that contains the old routes as its first argument,
and the path of the file you want the new routes to be at as its second argument:
```js
./migrateRoutes old_routes.js new_routes.js
```

[mmroute]: https://github.com/mammaldev/ng-mm-route
