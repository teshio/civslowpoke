/* eslint arrow-parens: ["error", "as-needed"]*/
/* global angular */
/* jslint plusplus: true */

(function() {
  'use strict';
  const app = angular.module('myApp');

  app.controller('playerController', ($scope, $timeout, $http, $cookies) => {
    $scope.players =[];

    $scope.getPlayers = () =>{
      $scope.players =[];

      $http.get('https://civslowpoke.azurewebsites.net/api/values/player').then(response =>{
        $scope.players = response.data;
      });
    };

    $scope.update = p =>{
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
