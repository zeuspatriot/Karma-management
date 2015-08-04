'use strict';

angular.module('karmaApp')
	.factory('Log', function ($resource){
		return $resource('/api/log/:id/:controller', {
			id: '@id'
		}
		, {
			get: {
				method: 'POST',
				params: {
					id: 'me'
				}
			}
		})
	});