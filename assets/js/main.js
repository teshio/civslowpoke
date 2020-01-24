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
      const lastGame = $cookies.get('lastGame');

      $scope.gameNames = allData.gameNames;
      $scope.selectedGameName = $scope.selectedGameName ||
        lastGame ||
        $scope.gameNames[$scope.gameNames.length - 1];

      const gameData = allData.games[$scope.selectedGameName];
      const turns = gameData.turns;

      const displayData = turns.map(t => ({
        playerName: t.player,
        created: t.eventDateTime,
        turn: t.turn,
        gameName: gameData.gameName,
        prettyDate: $scope.getPrettyDate(t.eventDateTime),
        timeTaken: t.turnTimeSecond === -1 ?
            null :
            Math.round(t.turnTimeSecond / 60, 0),
      }));

      const playerStats = gameData.players.map(p => ({
        playerName: p.name,
        turnAvg: roundToMinutes(p.averageTurnTimeSeconds),
        turnMin: roundToMinutes(p.minTurnTimeSeconds),
        turnMax: roundToMinutes(p.maxTurnTimeSeconds),
        turnStd: roundToMinutes(p.standardDeviationTurnTime),
        isTurn: p.isTurn,
      }));

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

    const roundToMinutes = s => Math.round(s / 60.0, 0);

    $scope.setChartData = data => {
      $scope.chartOptions = {
        chart: {
          type: 'lineChart',
          height: 450,
          margin: {
            top: 20,
            right: 0,
            bottom: 60,
            left: 70,
          },
          x: d => d[0],
          y: d => d[1],
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
            tickFormat: d => d,
            axisLabelDistance: -10,
          },
        },
      };

      if (data) {
        $scope.chartData = [{
          key: 'Turns',
          values: data.map(d =>
            ([
              moment.utc(d.created).valueOf(),
              d.turn,
            ])),
          area: true,
        }];
        refreshChart($scope.api);
      }
    };

    $scope.setChartData2 = data => {
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
          x: d => d[0],
          y: d => d[1],
          average: d => d.mean,
          color: d3.scale
              .category10()
              .range(),
          duration: 300,
          useInteractiveGuideline: true,
          clipVoronoi: true,
          xAxis: {
            axisLabel: 'Turn #',
            tickFormat: d => d,
            showMaxMin: true,
            staggerLabels: false,
            axisLabelDistance: 10,
          },
          yAxis: {
            axisLabel: 'Turn Time (mins)',
            tickFormat: d => d,
            axisLabelDistance: -10,
          },
        },
      };

      if (data) {
        const chartData = [];

        players = $scope.allData.games[gameName].players;

        players.forEach(player => {
          items = [];

          data.forEach(d => {
            if (d.playerName === player.name) {
              const item = [d.turn, d.timeTaken];
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
        refreshChart($scope.api2);
      }
    };

    const refreshChart = api => $timeout(() => api.refresh(), 100);

    $scope.turnClass = stat => stat.isTurn ? 'table-warning' : '';

    $scope.getData = () => {
      $scope.loading = true;
      $scope.data = [];
      $scope.allData = [];
      $http
          .get('https://civslowpoke.azurewebsites.net/api/values/all')
          .then(response => {
            $scope.allData = response.data;
            $scope.processData();
          });
    };

    $scope.getPrettyDate = d =>
      moment
          .utc(d)
          .format('HH:mm Do MMMM YYYY');

    $scope.setChartData();
    $scope.setChartData2();
    $scope.getData();
  });
}());
