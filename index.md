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

    <div class="row">
      <div class="col-12">
        <div class="form-group">
          <select class="form-control" ng-model="selectedGameName" ng-change="selectedGameNameChanged()">
            <option ng-repeat="n in gameNames">[[n]]</option>
          </select>
        </div>
      </div>
    </div>

    <h5>Player Turn Stats (mins)</h5>

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

    <h5>Turn History</h5>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Game Name</th>
            <th>Player</th>
            <th>Turn #</th>
            <th>Occurred At</th>
            <th>Time Taken (mins)</th>
            <th></th>
          </tr>
        </thead>
        <tr class="panel" ng-repeat="x in data | orderBy: '-created' ">
            <td>[[x.gameName]]</td>
            <td>[[x.playerName]]</td>
            <td>[[x.turn]]</td>
            <td>[[x.prettyDate]]</td>
            <td>[[x.timeTaken]]</td>
            <td>
              <span ng-show="x.timeTaken < 5 && x.timeTaken > 0"><i class="fas fa-fighter-jet fa-lg"></i></span>
              <span ng-show="x.timeTaken > 1000"><i class="fas fa-blind fa-lg"></i></span>
            </td>
        </tr>
      </table>
    </div>

    <p class="text-muted text-right"><small>last updated: [[lastUpdated]]</small></p>
  </div>
</div>
