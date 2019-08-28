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
    <button class="btn btn-primary" ng-click="getData()">Refresh</button>

    <br><br>

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
