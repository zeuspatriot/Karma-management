/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Log = require('../api/log/log.model');
var Rules = require('../api/rules/rules.model');

// Log.find({}).remove(function(){
//   console.log("Logs cleaned");
// });
// Rules.find({}).remove(function(){
//   Rules.create({
//     user: 'global',
//     content: [
//       {
//         points: 10,
//         msg: 'Campaign delivered in time'
//       },
//       {
//         points: 15,
//         msg: 'No more then 2 bugs where found on CrossCheck'
//       },
//       {
//         points: 20,
//         msg: 'No bugs where delivered to production'
//       },
//       {
//         points: -25,
//         msg:'Bugs found on production'
//       }
//     ]
//   }, function(){
//     console.log('Rules populated');
//   })
// })
var populate = function(num){
  for(var i=0; i<num;i++){
    User.create({
      provider: 'local',
      name: 'Test User'+i,
      email: 'test'+i+'@test.com',
      password: 'test',
      points: -15,
      recent: {
        points: -15,
        msg: 'Bad luck from the start'
      },
      team: 'EMEA Travel',
      jobCode: 'QA'
    },function(){})
  }
};
User.find({}).remove(function() {
  populate(20);
  User.create(
    {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin',
      team:'EMEA Dach',
      jobCode:'Admin',
      points: 25,
      recent: {
        points: 25,
        msg: 'Admin buf...yes it is unfair!'
      }
    }, function() {
      console.log('finished populating users');
    }
  );
});