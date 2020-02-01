/* eslint arrow-parens: ["error", "as-needed"]*/
/* global angular */
/* jslint plusplus: true */

(function() {
  'use strict';
  const app = angular.module('myApp');

  app.controller('playerController', ($scope, $timeout, $http, $cookies) => {
    $scope.players =[];

    const hoursAllocations = 100;
    $scope.getAvailableHours = p => hoursAllocations - $scope.getUsedHours(p);

    $scope.getUsedHours = p => {
      let sum = 0;
      p.exclusions.forEach(day => {
        sum += day.hours.filter(h => h).length;
      });

      return sum;
    };

    $scope.allSwitch = (player, n, mode = 'switch') => {
      player.exclusions.forEach(e => {
        const target = mode === 'switch' ? !e.hours[n] : mode;
        e.hours.forEach((h, index) => {
          if (index == n) {
            e.hours[index] = target;
          }
        });
      });
    };

    $scope.getPlayers = () =>{
      $scope.players =[];

      $http.get('https://civslowpoke.azurewebsites.net/api/values/player').then(response =>{
        $scope.players = response.data;
      });
    };

    $scope.update = p =>{
      if ($scope.getAvailableHours(p) < 0) {
        alert('allocated too many hours');
        return;
      }

      p.inProgress = true;
      console.log(JSON.stringify(p));
      $http.post('https://civslowpoke.azurewebsites.net/api/values/player', [p]).then(() => {
        p.inProgress = false;
        p.saved = true;
        $timeout(() => {
          p.saved = false;
        }, 3000);
      }, r => {
        console.log('error: ' + r);
        p.inProgress = false;
        p.error = true;
        $timeout(() => {
          p.error = false;
        }, 3000);
      });
    };

    $scope.getPlayers();
  });
}());
