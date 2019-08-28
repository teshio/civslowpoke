---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
permalink: /
layout: default
---

<div class="container" ng-app="myApp" ng-controller="myCtrl">
  <div ng-show="loading">
    <button class="btn btn-primary" disabled="disabled"><i class="fas fa-spinner fa-spin"></i> Loading...</button>

  </div>
  <div ng-hide="loading">
    <div class="row mb-3">
      <div class="col-12">
        <button class="btn btn-block btn-primary" ng-click="getData()">Refresh</button>

      </div>
    </div>
    <div class="row ">
      <div class="col-md-4 mb-3" ng-repeat="(key, value) in data | groupBy: 'playerName' ">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">[[key]]</h5>
            <p class="card-text">
              Average Turn Time: <span class="badge badge-primary">[[calculateAverage(value)]] mins </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
        <th>Game Name</th>
        <th>Player</th>
        <th>Turn #</th>
        <th>Occurred At</th>
        <th>Time Taken (mins)</th>
        </tr>
      </thead>
      <tr class="panel" ng-repeat="x in data | orderBy: '-created' ">
          <td>[[x.gameName]]</td>
          <td>[[x.playerName]]</td>
          <td>[[x.turn]]</td>
          <td>[[x.prettyDate]]</td>
          <td>[[x.timeTaken]]</td>
      </tr>
    </table>

    <p class="text-muted text-right"><small>last updated: [[lastUpdated]]</small></p>
  </div>
</div>
