'use strict';

angular.module('karmaApp')
	.factory('Rules', function ($resource){
		return $resource('/api/rules/:id/:controller', 
		{
			id: '@_id'
		},
		{
			getByUserId: {
				method: 'POST',
				params: {
					controller: 'user'
				}
			},
			addRules: {
				method: 'PUT',
				params: {
					controller: 'add'
				}
			},
			assign: {
				method: 'PUT',
				params: {
					controller: 'assign'
				}
			},
			deleteById: {
				method: 'PUT',
				params: {
					controller: 'delete'
				}
			}
		})
	})