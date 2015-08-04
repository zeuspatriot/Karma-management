'use strict';

angular.module('karmaApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      update: {
        method: 'PUT',
        params: {
          controller: 'update'
        }
      },
      changeUserKarma: {
        method: 'PUT',
        params: {
          controller: 'changeUserKarma'
        }
      },
      show: {
        method: 'GET'
      }
	  });
  });
