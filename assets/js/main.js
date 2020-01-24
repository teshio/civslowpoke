/* global angular, moment, d3 */
/* jslint plusplus: true */

(function() {
  'use strict';
  const app = angular.module('myApp', [
    'angular.filter',
    'nvd3',
    'ngCookies',
  ], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  });

  app.controller('myCtrl', function($scope, $timeout, $http, $cookies) {
    $scope.loading = true;

    $scope.selectedGameNameChanged = function() {
      $scope.processData();
      $cookies.put('lastGame', $scope.selectedGameName, {
        expires: moment('2025-01-01').toDate(),
      });
    };

    $scope.processData = function() {
      const allData = $scope.allData;
      const playerStats = [];

      $scope.gameNames = allData.gameNames;
      const lastGame = $cookies.get('lastGame');
      $scope.selectedGameName = $scope.selectedGameName ||
        lastGame ||
        $scope.gameNames[$scope.gameNames.length - 1];

      const gameData = allData.games[$scope.selectedGameName];
      const turns = gameData.turns;
      const displayData = [];

      turns.forEach(function(t) {
        displayData.push({
          playerName: t.player,
          created: t.eventDateTime,
          turn: t.turn,
          gameName: gameData.gameName,
          prettyDate: $scope.getPrettyDate(t.eventDateTime),
          timeTaken: t.turnTimeSecond === -1 ?
            null :
            Math.round(t.turnTimeSecond / 60, 0),
        });
      });

      gameData.players.forEach(function(p) {
        playerStats.push({
          playerName: p.name,
          turnAvg: Math.round(p.averageTurnTimeSeconds / 60.0, 0),
          turnMin: Math.round(p.minTurnTimeSeconds / 60.0, 0),
          turnMax: Math.round(p.maxTurnTimeSeconds / 60.0, 0),
          turnStd: Math.round(p.standardDeviationTurnTime / 60.0, 0),
          isTurn: p.isTurn,
        });
      });

      $scope.gameStats = {
        turnsPerDay: gameData.turnRate,
      };
      $scope.playerStats = playerStats;
      $scope.data = displayData;
      $scope.setChartData(displayData);
      $scope.setChartData2(displayData);
      $scope.lastUpdated = moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
      $scope.loading = false;
    };

    $scope.setChartData = function(data) {
      let i;
      let d;
      let items;
      let item;
      const chartData = [];

      $scope.chartOptions = {
        chart: {
          type: 'lineChart',
          height: 450,
          margin: {
            top: 20,
            right: 0,
            bottom: 60,
            left: 0,
          },
          x: function(d) {
            return d[0];
          },
          y: function(d) {
            return d[1];
          },

          color: d3.scale.category10().range(),
          useInteractiveGuideline: true,
          clipVoronoi: false,

          xAxis: {
            axisLabel: 'Turn Time',
            tickFormat: function(d) {
              return d3.time.format('%d/%m/%y')(new Date(d));
            },
            showMaxMin: true,
            staggerLabels: true,
            axisLabelDistance: 10,
          },

          yAxis: {
            axisLabel: 'Turn No.',
            tickFormat: function(d) {
              return d;
            },
            axisLabelDistance: 0,
          },
        },
      };


      if (data) {
        items = [];
        for (i = 0; i < data.length; i++) {
          d = data[i];
          item = [moment.utc(d.created).valueOf(), d.turn];
          items.push(item);
        }

        chartData.push({
          key: 'Turns',
          values: items,
          area: true,
        });
        $scope.chartData = chartData;
        $timeout(function() {
          $scope.api.refresh();
        }, 10);
      }
    };

    $scope.setChartData2 = function(data) {
      const chartData = [];
      let item;
      let items;
      let player;
      let players;
      const gameName = $scope.selectedGameName;
      let avg;
      let d;
      let i;
      let j;
      let k;

      $scope.chartOptions2 = {
        chart: {
          type: 'lineChart',
          height: 450,
          margin: {
            top: 20,
            right: 20,
            bottom: 60,
            left: 70,
          },
          x: function(d) {
            return d[0];
          },
          y: function(d) {
            return d[1];
          },
          average: function(d) {
            return d.mean;
          },
          color: d3.scale.category10()
              .range(),
          duration: 300,
          useInteractiveGuideline: true,
          clipVoronoi: true,

          xAxis: {
            axisLabel: 'Turn #',
            tickFormat: function(d) {
              return d;
            },
            showMaxMin: true,
            staggerLabels: false,
            axisLabelDistance: 10,
          },

          yAxis: {
            axisLabel: 'Turn Time (mins)',
            tickFormat: function(d) {
              return d;
            },
            axisLabelDistance: -10,
          },
        },
      };

      if (data) {
        players = $scope.allData.games[gameName].players;

        for (j = 0; j < players.length; j++) {
          player = players[j];
          items = [];

          for (i = 0; i < data.length; i++) {
            d = data[i];
            if (d.playerName === player.name) {
              item = [d.turn, d.timeTaken];
              items.push(item);
            }
          }

          avg = 0;
          for (k = 0; k < $scope.playerStats.length; k++) {
            if ($scope.playerStats[k].playerName === player.name) {
              avg = $scope.playerStats[k].turnAvg;
            }
          }
          chartData.push({
            key: player.name,
            values: items,
            area: false,
            mean: avg,
          });
        }

        $scope.chartData2 = chartData;
        $timeout(function() {
          $scope.api2.refresh();
        }, 500);
      }
    };

    $scope.turnClass = function(stat) {
      return stat.isTurn ? 'table-warning' : '';
    };

    $scope.getData = function() {
      $scope.data = [];
      $scope.allData = [];
      $scope.loading = true;
      $http.get('https://civslowpoke.azurewebsites.net/api/values/all')
          .then(function(response) {
            $scope.allData = response.data;
            $scope.processData();
          });
    };

    $scope.getPrettyDate = function(d) {
      const dt = moment.utc(d);
      return dt.format('HH:mm Do MMMM YYYY');
    };

    $scope.setChartData();
    $scope.setChartData2();
    $scope.getData();
  });
}());
