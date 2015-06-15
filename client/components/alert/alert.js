/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
'use strict';

angular.module('karmaApp')
  .factory('Alert', [function() {
    var alerts = [];
    var isRunning = false;

    var alertBoxGenerator = function(title, message, type) {
      var elem = angular.element('<div></div>');
      elem.addClass('alert');
      elem.css({
        'position': 'fixed',
        'left': '50%',
        'margin-top':'35px',
        'box-shadow':'0 0 15px grey',
        'z-index': '10000',
        'box-sizing': 'border-box',
        WebkitTransition : 'top 1s ease-in-out',
        MozTransition    : 'top 1s ease-in-out',
        MsTransition     : 'top 1s ease-in-out',
        OTransition      : 'top 1s ease-in-out',
        transition       : 'top 1s ease-in-out'
      });

      if(!message){
        elem.html(title);
      } else {
        elem.html('<strong>'+title+'</strong> '+message);
      }

      if(!title && !message){
        elem.html('Unknow error');
      }
      
      elem.addClass('alert-'+ (type ? type : 'danger') );

      elem.appendTo('body');

      return elem;
    };

    var resetAlertsPositions = function() {
      var top = 10, height=0;
      for(var i = 0 ; i < alerts.length; i++){
        alerts[i].css('top', top);
        height = alerts[i].css('height').replace('px', '') * 1;
        top += height + 10;
      }

      if(!isRunning && alerts.length){
        isRunning = true;
        setTimeout(function() {
          alerts.shift().fadeOut(1000, function() {
            isRunning = false;
            resetAlertsPositions();
            this.remove();
          });
        }, 3000);
      }
    };


    return function(title, message, type) {
      alerts.push(alertBoxGenerator(title, message, type));
      resetAlertsPositions();
    };
  }]);