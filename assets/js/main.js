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
    $scope.activityBy = 'day';

    $scope.selectedGameNameChanged = () => {
      $scope.processData();
      $cookies.put('lastGame', $scope.selectedGameName, {
        expires: moment('2025-01-01').toDate(),
      });
    };

    $scope.activityByChanged = () => {
      $scope.processData();
    };

    $scope.processData = () => {
      const allData = $scope.allData;
      const lastGame = $cookies.get('lastGame');

      $scope.gameNames = allData.gameNames;
      $scope.selectedGameName = $scope.selectedGameName ||
        lastGame ||
        $scope.gameNames[$scope.gameNames.length - 1];

      const gameData = allData.games[$scope.selectedGameName];

      const displayData = gameData.turns.map(t => ({
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
      $scope.setChartDataTurns(displayData);
      $scope.setChartDataPlayerTurnTime(displayData);
      $scope.setChartDataActivity(displayData);
      $scope.lastUpdated = moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
      $scope.loading = false;
    };

    $scope.setChartDataActivity = data => {
      $scope.chartOptions3 ={
        chart: {
          type: 'historicalBarChart',
          height: 450,
          margin: {
            top: 20,
            right: 0,
            bottom: 110,
            left: 70,
          },
          x: function(d) {
            return d[0];
          },
          y: function(d) {
            return d[1];
          },
          showValues: true,
          valueFormat: function(d) {
            return d3.format('1f')(d);
          },
          duration: 100,
          xAxis: {
            axisLabel: 'Date/Time',
            tickFormat: function(d) {
              let format = '%d/%m/%y %H:%M';
              switch ($scope.activityBy) {
                case 'day':
                  format = '%a %d/%m/%y';
                  break;
                case 'month':
                  format = '%b %y';
                  break;
                case 'year':
                  format = '%Y';
                  break;
              }
              return d3.time.format(format)(new Date(d));
            },
            rotateLabels: 30,
            showMaxMin: false,
          },
          yAxis: {
            axisLabel: 'Turns taken across all players',
            axisLabelDistance: -10,
            tickFormat: function(d) {
              return d3.format(',1f')(d);
            },
          },
          tooltip: {
            keyFormatter: d=> {
              let format = '%d/%m/%y %H:%M';
              switch ($scope.activityBy) {
                case 'day':
                  format = '%a %d/%m/%y';
                  break;
                case 'month':
                  format = '%b %y';
                  break;
                case 'year':
                  format = '%Y';
                  break;
              }

              return d3.time.format(format)(new Date(d));
            },
            valueFormatter: d => (d + ' turn' + (d === 1 ? '' : 's')),
          },
          zoom: {
            enabled: false,
            scaleExtent: [1, 10],
            useFixedDomain: false,
            useNiceScale: false,
            horizontalOff: false,
            verticalOff: true,
            unzoomEventType: 'dblclick.zoom',
          },
        },
      };

      if (data) {
        const groupByAmount = $scope.activityBy;
        const dataByGrouping = data.map(d => ({
          key: moment.utc(d.created).startOf(groupByAmount),
          value: 1,
        }));

        const groupBy = function(xs, key) {
          return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
        };

        const s = groupBy(dataByGrouping, 'key');

        const dataToShow = [];
        for (const key in s) {
          if (s.hasOwnProperty(key)) {
            dataToShow.push([moment.utc(key).valueOf(), s[key].length]);
          }
        }

        $scope.chartData3 = [{
          key: 'Turns',
          values: dataToShow,
          area: true,
        }];
      }

      refreshChart($scope.api3);
    };

    $scope.setChartDataTurns = data => {
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
          // gather array of [datetime, turnNo] pairs
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

    $scope.setChartDataPlayerTurnTime = data => {
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
        // get all possible players for current game
        const players = $scope
            .allData
            .games[$scope.selectedGameName]
            .players;

        // gather player's turn times
        $scope.chartData2 = players.map(player =>
          ({
            key: player.name,
            values: data
                .filter(d => d.playerName === player.name)
                .map(d => [d.turn, d.timeTaken]),
            area: false,
            mean: ($scope
                .playerStats
                .find(s => s.playerName === player.name) || {turnAvg: 0})
                .turnAvg,
          }));

        refreshChart($scope.api2);
      }
    };

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

    // private functions
    const refreshChart = api => $timeout(() => api.refresh(), 100);
    const roundToMinutes = s => Math.round(s / 60.0, 0);

    $scope.getData();
  });
}());
