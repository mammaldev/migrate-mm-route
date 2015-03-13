#!/usr/bin/env node

var fs = require('fs');

var routes = fs.readFileSync(process.argv[ 2 ], 'utf8');
routes = eval('('+routes+')');
var newRoutes = migrate(routes);
fs.writeFile(process.argv[ 3 ], JSON.stringify(newRoutes));


function createAccessObject( routeInfo, role ) {

  var accessObject = {};
  var page = {};
  Object.keys(routeInfo).forEach(function ( key ) {
    if ( key !== 'url' ) {
      page[ key ] = routeInfo[ key ];
    }
  });

  accessObject.page = page;
  accessObject.roles = [ role ];
  return accessObject;
}

function migrate ( oldRoutes ) {
  function parseRoute( routeObj, role, usedKeys ) {
    if ( Object.keys(routeObj).length > 0 ) {
      if ( !routeObj.hasOwnProperty('url') ) {
        usedKeys = usedKeys ? usedKeys : [];
        var keys = Object.keys(routeObj).reverse();
        var nestedRoute = routeObj[ keys[ 0 ] ];
        delete routeObj[ keys[ 0 ] ];
        parseRoute(routeObj, role, usedKeys);
        var newUsedKeys = JSON.parse(JSON.stringify(usedKeys));
        newUsedKeys.push(keys[ 0 ]);
        parseRoute(nestedRoute, role, newUsedKeys);
      }
      else {
        var routeExists = true;
        var nestedNewRoutes = newRoutes;
        usedKeys.forEach(function ( key, index ) {
          if ( index < usedKeys.length - 1 ) {
            if ( !nestedNewRoutes[ key ] ) {
              routeExists = false;
              nestedNewRoutes[ key ] = {};
            }
            nestedNewRoutes = nestedNewRoutes[ key ];
          }
        });
        var existingRouteInfo = nestedNewRoutes[ usedKeys[ usedKeys.length - 1] ];
        if ( !existingRouteInfo ) {
          routeExists = false;
        }
        if ( !routeExists ) {
          var newUrlObj = {};
          newUrlObj.url = routeObj.url;
          var accessArray = [];
          accessArray.push(createAccessObject(routeObj, role));
          newUrlObj.access = accessArray;
          nestedNewRoutes[ usedKeys[ usedKeys.length -1 ] ] = newUrlObj;
        } else {
          var foundTemplate = false;
          existingRouteInfo.access.forEach(function ( accessObject ) {
            var pageKeys = Object.keys(accessObject.page);
            if ( pageKeys.length === Object.keys(routeObj).length - 1 &&
              pageKeys.every(function ( key ) {
                return accessObject.page[ key ] === routeObj[ key ];
              })
            ) {
              foundTemplate = true;
              accessObject.roles.push(role);
            }
          });
          if ( !foundTemplate ) {
            nestedNewRoutes[ usedKeys[ usedKeys.length -1 ] ].access.push(createAccessObject(routeObj, role));
          }
        }
      }
    }
  }
  newRoutes = {};
  Object.keys(oldRoutes).forEach(function ( role ) {
    parseRoute(oldRoutes[ role ], role);
  });
  return newRoutes;
}

