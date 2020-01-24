/* eslint arrow-parens: ["error", "as-needed"]*/
/* global angular, moment, d3 */
/* jslint plusplus: true */

(function() {
  'use strict';
  const app = angular.module('myApp', [
    'angular.filter',
    'nvd3',
    'ngCookies',
  ], $interpolateProvider => {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  });

  app.controller('myCtrl', ($scope, $timeout, $http, $cookies) => {
    $scope.loading = true;

    $scope.selectedGameNameChanged = () => {
      $scope.processData();
      $cookies.put('lastGame', $scope.selectedGameName, {
        expires: moment('2025-01-01').toDate(),
      });
    };

    $scope.processData = () => {
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

      turns.forEach(t => {
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

      gameData.players.forEach(p => {
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

    $scope.setChartData = data => {
      let items;
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
          x: d => {
            return d[0];
          },
          y: d => {
            return d[1];
          },

          color: d3.scale.category10().range(),
          useInteractiveGuideline: true,
          clipVoronoi: false,

          xAxis: {
            axisLabel: 'Turn Time',
            tickFormat: d => {
              return d3.time.format('%d/%m/%y')(new Date(d));
            },
            showMaxMin: true,
            staggerLabels: true,
            axisLabelDistance: 10,
          },

          yAxis: {
            axisLabel: 'Turn No.',
            tickFormat: d => {
              return d;
            },
            axisLabelDistance: 0,
          },
        },
      };


      if (data) {
        items = [];
        data.forEach(d => {
          items.push([moment.utc(d.created).valueOf(), d.turn]);
        });

        chartData.push({
          key: 'Turns',
          values: items,
          area: true,
        });
        $scope.chartData = chartData;
        $timeout(() => {
          $scope.api.refresh();
        }, 100);
      }
    };

    $scope.setChartData2 = data => {
      const chartData = [];
      let item;
      let items;
      let players;
      const gameName = $scope.selectedGameName;

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
          x: d => {
            return d[0];
          },
          y: d => {
            return d[1];
          },
          average: d => {
            return d.mean;
          },
          color: d3.scale.category10()
              .range(),
          duration: 300,
          useInteractiveGuideline: true,
          clipVoronoi: true,

          xAxis: {
            axisLabel: 'Turn #',
            tickFormat: d => {
              return d;
            },
            showMaxMin: true,
            staggerLabels: false,
            axisLabelDistance: 10,
          },

          yAxis: {
            axisLabel: 'Turn Time (mins)',
            tickFormat: d => {
              return d;
            },
            axisLabelDistance: -10,
          },
        },
      };

      if (data) {
        players = $scope.allData.games[gameName].players;

        players.forEach(player => {
          items = [];

          data.forEach(d => {
            if (d.playerName === player.name) {
              item = [d.turn, d.timeTaken];
              items.push(item);
            }
          });

          let avg = 0;
          $scope.playerStats.forEach(playerStat => {
            if (playerStat.playerName === player.name) {
              avg = playerStat.turnAvg;
            }
          });
          chartData.push({
            key: player.name,
            values: items,
            area: false,
            mean: avg,
          });
        });

        $scope.chartData2 = chartData;
        $timeout(() => {
          $scope.api2.refresh();
        }, 500);
      }
    };

    $scope.turnClass = stat => {
      return stat.isTurn ? 'table-warning' : '';
    };

    $scope.getData = () => {
      $scope.data = [];
      $scope.allData = [];
      $scope.loading = true;
      $http.get('https://civslowpoke.azurewebsites.net/api/values/all')
          .then(response => {
            $scope.allData = response.data;
            $scope.processData();
          });
    };

    $scope.getPrettyDate = d => {
      const dt = moment.utc(d);
      return dt.format('HH:mm Do MMMM YYYY');
    };

    $scope.setChartData();
    $scope.setChartData2();
    $scope.getData();
  });
}());
