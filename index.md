---
permalink: /
layout: default
---

<div class="container" ng-app="myApp" ng-controller="myCtrl">
  <div ng-show="loading">
    <button class="btn btn-block btn-primary" disabled="disabled"><i class="fas fa-spinner fa-spin"></i> Loading...</button>
  </div>

  <div ng-hide="loading">
    <div class="row mb-3">
      <div class="col-12">
        <button class="btn btn-block btn-primary" ng-click="getData()">Refresh</button>
      </div>
    </div>

    <h5>Your Turn Now!</h5>
    <div class="row mb-3">
      <div class="col-12">
        <div class="card">
          <ul class="list-group list-group-flush">
            <li
              class="list-group-item"
              ng-show="value.length > 0"
              ng-repeat="(key, value) in allData.playerCurrentTurns">
              <div class="row">
                <div class="col-12 mb-1 pulsate text-danger">
                  <i class="fas fa-cog fa-spin" ></i> [[key]]
                </div>
                <div class="col text-right">
                  <button
                    ng-click="gameBadgeClicked(g)"
                    class="mr-1 mb-1 btn btn-sm"
                    ng-repeat="g in value"
                    ng-class="{
                        'btn-primary': selectedGameName !== g ,
                        'btn-warning': selectedGameName === g
                      }" >
                    [[g]]
                  </button>

                </div>
              </div>

            </li>
          </ul>
        </div>
      </div>
    </div>

    <h5>All Game Stats</h5>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th></th>
            <th>Turns Taken</th>
          </tr>
        </thead>
        <tr ng-repeat="(k,v) in allData.allGameStats.playerTotalTurnsTaken">
          <td>[[k]]</td>
          <td>[[v]]</td>
        </tr>
        <tfoot>
          <tr class="font-weight-bold">
            <td class="text-right">Total</td>
            <td>[[allData.allGameStats.totalTurnsTaken]]</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <h5>Game Stats - [[selectedGameName]]</h5>
    <div class="row">
      <div class="col-12">
        <div class="form-group">
          <select class="form-control" ng-model="selectedGameName" ng-change="selectedGameNameChanged()">
            <optgroup label="Current Games">
              <option ng-repeat="n in games" ng-if="!n.completed">[[n.gameName]]</option>
            </optgroup>
            <optgroup label="Finished Games">
              <option ng-repeat="n in games" ng-if="n.completed">[[n.gameName]]</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>

    <h6>Player Turn Stats (mins)</h6>

    <div class="table-responsive ">
      <table class="table table-striped">
        <thead>
          <tr>
            <th></th>
            <th>Avg</th>
            <th>Min</th>
            <th>Max</th>
            <th>Std Dev</th>
            <th></th>
          </tr>
        </thead>
        <tr class="panel"
          ng-repeat="stat in playerStats | orderBy : 'turnAvg' "
          ng-class="turnClass(stat)" >
          <td>[[stat.playerName]] <span ng-show="$first" title="quickest turn taker award"><i class="fas fa-medal"></i></span></td>
          <td>[[stat.turnAvg]]</td>
          <td>[[stat.turnMin]]</td>
          <td>[[stat.turnMax]]</td>
          <td>[[stat.turnStd]]</td>
          <td><span ng-show="[[stat.isTurn]]" title="Player Turn!"><i class="fas fa-exclamation-triangle"></i></span></td>
        </tr>
      </table>
    </div>
    <h6>Run Chart</h6>
    <p>
    <i class="fas fa-lg fa-tachometer-alt animated tada" title="game speed"></i>
     <strong>[[gameStats.turnsPerDay | number: 2]] turns/day</strong>
    </p>

    <nvd3 options="chartOptions" data="chartData" api="api"></nvd3>

  <div class="d-none d-lg-block">
      <h6>Activity Chart</h6>
      <div class="row">
        <div class="col-12">
          <div class="form-group">
            <select class="form-control" ng-model="activityBy" ng-change="activityByChanged()">
              <option value="hour">By Hour</option>
              <option value="day">By Day</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
          </div>
        </div>
      </div>
      <nvd3 options="chartOptions3" data="chartData3" api="api3"></nvd3>
  </div>

    <h6>Activity Trend by Hour</h6>
    <nvd3 options="chartOptions4" data="chartData4" api="api4"></nvd3>

    <h6>Player Performance Chart</h6>
    <nvd3 options="chartOptions2" data="chartData2" api="api2"></nvd3>



    <h6>Turn History - [[selectedGameName]]</h6>

    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th></th>
            <th>Player</th>
            <th>Turn #</th>
            <th>Turn Available At</th>
            <th>Time Taken (mins)</th>
          </tr>
        </thead>
        <tr class="panel" ng-repeat="x in data | orderBy: '-created' ">
            <td>
              <span ng-show="x.timeTaken < getJetTimeMin(x) && x.timeTaken > 0">
                <i class="fas fa-fighter-jet d-inline d-sm-none"></i>
                <i class="fas fa-fighter-jet fa-lg d-none d-sm-inline"></i>
              </span>
              <span ng-show="x.timeTaken > 1000">
                <i class="fas fa-blind fa-lg"></i>
              </span>
            </td>
            <td><small>[[x.playerName]]</small></td>
            <td><small>[[x.turn]]</small></td>
            <td><small>[[x.prettyDate]]</small></td>
            <td ng-class="{'pulsate': $first, 'text-danger': $first }" >
              <small>
              [[x.timeTaken]]
              <i class="fas fa-cog fa-spin" ng-show="$first"></i>
              </small>
            </td>
        </tr>
      </table>
    </div>

    <p class="text-muted text-right">
      <small>last updated: [[lastUpdated]]</small><br>
      <small>data fetch time: [[allData.allGameStats.dataFetchTimeMs]]ms</small><br>
      <small>data processing time: [[allData.allGameStats.dataProcessingTimeMs]]ms</small>
    </p>
  </div>
</div>
