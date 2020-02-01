---
permalink: player-settings
layout: default
---

<div ng-app="myApp" ng-controller="playerController">


<h5>Player Settings</h5>
<p>Coming Soon!</p>
<div class="row">

  <div class="col-12 mb-3" ng-repeat="p in players">

    <div class="card">
      <div class="card-header">
            [[p.name]]
      </div>
      <div class="card-body">
        <h6 class="card-title">
          Exclusion Hours - hours used: [[getUsedHours(p)]] / remaining: [[getAvailableHours(p)]]</h6>
        <p class="card-text">
          <table class="table table-striped table-sm table-responsive">
            <thead>
              <tr>
                <th>Time (24h) </th>
                <th ng-repeat="n in [] | range:24" class="text-center">
                  [[n]]
                </th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="e in p.exclusions">
                <td>
                [[e.day]]
                </td>
                <td ng-repeat="n in [] | range:24" class="text-center">
                  <div class="form-check">
                    <input class="form-check-input"
                      type="checkbox"
                      ng-model="e.hours[n]"
                      title="[[e.day]] [[n]]" />
                  </div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td ng-repeat="n in [] | range:24" class="text-center">
                  <button class="btn mb-1 btn-secondary btn-sm" ng-click="allSwitch(p, n)">
                    <i class="fas fa-sync-alt text-white"></i>
                  </button><br>
                  <button class="btn mb-1 btn-secondary btn-sm" ng-click="allSwitch(p, n, true)">
                    <i class="fas fa-check text-white"></i>
                  </button><br>
                  <button class="btn mb-1 btn-secondary btn-sm btn-block" ng-click="allSwitch(p, n, false)">
                    <i class="fas fa-times text-white"></i>
                  </button>
                </td>
              </tr>
            </tbody>

          </table>
          <button class="btn btn-primary" ng-disabled="p.inProgress" ng-click="update(p)">Update</button>
          <div class="alert alert-success mt-1" ng-show="p.saved">Saved</div>
          <div class="alert alert-danger mt-1" ng-show="p.error">Boo! Error occured.</div>
        </p>
      </div>
    </div>

  </div>
</div>
</div>
