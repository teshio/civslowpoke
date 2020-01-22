var app = angular.module('myApp', ['angular.filter', 'nvd3'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('myCtrl', function ($scope, $timeout, $filter, $http) {
    $scope.loading = true;

    $scope.selectedGameNameChanged = function () {
        $scope.processData();
    };

    $scope.processData = function () {
        var allData = $scope.allData;
        $scope.gameNames = allData.gameNames;

        if ($scope.selectedGameName == null) {
            $scope.selectedGameName = $scope.gameNames[$scope.gameNames.length - 1];
        }

        var gameData = allData.games[$scope.selectedGameName];
        var turns = gameData.turns;
        var displayData = [];

        for (var i = 0; i < turns.length; i++) {
            var turnTimeSecond = turns[i].turnTimeSecond;
            var d = {
                playerName: turns[i].player,
                created: turns[i].eventDateTime,
                turn: turns[i].turn,
                gameName: gameData.gameName,
                prettyDate: $scope.getPrettyDate(turns[i].eventDateTime),
                timeTaken: turnTimeSecond === -1 ? null : Math.round(turnTimeSecond / 60, 0)
            };
            displayData.push(d);
        }

        var playerStats = [];
        for (var i = 0; i < gameData.players.length; i++) {
            var p = gameData.players[i];
            var s = {
                playerName: p.name,
                turnAvg: Math.round(p.averageTurnTimeSeconds / 60.0, 0),
                turnMin: Math.round(p.minTurnTimeSeconds / 60.0, 0),
                turnMax: Math.round(p.maxTurnTimeSeconds / 60.0, 0),
                turnStd: Math.round(p.standardDeviationTurnTime / 60.0, 0),
                isTurn: p.isTurn
            };
            playerStats.push(s);
        }
        $scope.gameStats = {
            turnsPerDay: gameData.turnRate
        };
        $scope.playerStats = playerStats;
        $scope.data = displayData;
        $scope.setChartData(displayData);
        $scope.setChartData2(displayData);
        $scope.lastUpdated = moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
        $scope.loading = false;
    };

    $scope.setChartData = function (data) {
        $scope.chartOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 0,
                    bottom: 60,
                    left: 0
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                },
                //average: function(d) { return d.mean/100; },

                color: d3.scale.category10().range(),
                //duration: 300,
                useInteractiveGuideline: true,
                clipVoronoi: false,

                xAxis: {
                    axisLabel: 'Turn Time',
                    tickFormat: function (d) {
                        return d3.time.format('%d/%m/%y')(new Date(d))
                    },
                    showMaxMin: true,
                    staggerLabels: true,
                    axisLabelDistance: 10
                },

                yAxis: {
                    axisLabel: 'Turn No.',
                    tickFormat: function (d) {
                        //return d3.format('1')(d);
                        return d;
                    },
                    axisLabelDistance: 0
                }
            }
        };

        var chartData = [];

        if (data) {
            var items = [];
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                var item = [moment.utc(d.created).valueOf(), d.turn];
                items.push(item);
            }

            chartData.push({
                key: 'Turns',
                values: items,
                area: true
            });
            $scope.chartData = chartData;
            $timeout(function () {
                $scope.api.refresh();
            }, 10);

        }
    };

    $scope.setChartData2 = function (data) {
        $scope.chartOptions2 = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 70
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                },
                average: function (d) {
                    debugger;
                    return d.mean;
                },
                color: d3.scale.category10().range(),
                duration: 300,
                useInteractiveGuideline: true,
                clipVoronoi: true,

                xAxis: {
                    axisLabel: 'Turn #',
                    tickFormat: function (d) {
                        return d;
                    },
                    showMaxMin: true,
                    staggerLabels: false,
                    axisLabelDistance: 10
                },

                yAxis: {
                    axisLabel: 'Turn Time (mins)',
                    tickFormat: function (d) {
                        return d;
                    },
                    axisLabelDistance: -10
                }
            }
        };

        var chartData = [];

        if (data) {

            var gameName = $scope.selectedGameName;
            var players = $scope.allData.games[gameName].players;

            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                var items = [];

                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    if (d.playerName == player.name) {
                        var item = [d.turn, d.timeTaken];
                        items.push(item);
                    }
                }

                var avg = 0;
                for (var k = 0; k < $scope.playerStats.length; k++) {
                    if ($scope.playerStats[k].playerName == player.name) {
                        avg = $scope.playerStats[k].turnAvg;
                    }
                }
                chartData.push({
                    key: player.name,
                    values: items,
                    area: false,
                    mean: avg
                });
            }

            $scope.chartData2 = chartData;
            $timeout(function () {
                $scope.api2.refresh();
            }, 500);
        }
    };



    $scope.turnClass = function (stat) {
        return stat.isTurn ? 'table-warning' : '';
    };

    $scope.getData = function () {
        $scope.data = [];
        $scope.allData = [];
        $scope.loading = true;
        $http.get('https://civslowpoke.azurewebsites.net/api/values/all')
            .then(function (response) {
                $scope.allData = response.data;
                $scope.processData();
            });
    };

    $scope.getPrettyDate = function (d) {
        var dt = moment.utc(d);
        return dt.format("HH:mm Do MMMM YYYY");
    }

    $scope.setChartData();
    $scope.setChartData2();
    $scope.getData(null);

});