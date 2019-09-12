'use strict';

angular.module('topcoderX')
  .controller('MainController', ['$scope', '$rootScope', 'Alert', '$state', 'AuthService', 'IssueService', 'SettingService', '$log',
    function ($scope, $rootScope, Alert, $state, AuthService, IssueService, SettingService, $log) {
      $scope.isLoaded = false;
      $scope.tableConfig = {
        readyForReview: {
          pageNumber: 1,
          pageSize: 20,
          isLoading: false,
          items: [],
          label: 'tcx_ReadyForReview',
          sortBy: 'updatedAt',
          sortDir: 'desc',
          totalPages: 1,
          initialized: false,
        },
        assigned: {
          pageNumber: 1,
          pageSize: 20,
          isLoading: false,
          items: [],
          label: 'tcx_Assigned',
          sortBy: 'updatedAt',
          sortDir: 'desc',
          totalPages: 1,
          initialized: false,
        },
        openForPickup: {
          pageNumber: 1,
          pageSize: 20,
          isLoading: false,
          items: [],
          label: 'tcx_OpenForPickup',
          sortBy: 'updatedAt',
          sortDir: 'desc',
          totalPages: 1,
          initialized: false,
        },
        paid: {
          pageNumber: 1,
          pageSize: 20,
          isLoading: false,
          items: [],
          label: 'tcx_Paid',
          sortBy: 'updatedAt',
          sortDir: 'desc',
          totalPages: 1,
          initialized: false,
        },
      };
      $rootScope.currentUser = AuthService.getCurrentUser();

      $scope.logout = function () {
        AuthService.logout();
        $state.go('auth');
      };

      // auth
      $scope.authorized = function () {
        return AuthService.isLoggedIn();
      };

      var _search = function (provider) {
        var config = $scope.tableConfig[provider];
        config.isLoading = true;
        IssueService.search(config.label, config.sortBy, config.sortDir, config.pageNumber, config.pageSize)
          .then(function (res) {
            config.items = res.data.docs;
            config.pages = res.data.pages;
            config.isLoading = false;
            config.initialized = true;
          }).catch(function (err) {
            config.isLoading = false;
            config.initialized = true;
            _handleError(err, 'An error occurred while getting the data for ' + provider + '.');
          });
      };

      _search('readyForReview');

      // handle errors
      function _handleError(error, defaultMsg) {
        var errMsg = error.data ? error.data.message : defaultMsg;
        Alert.error(errMsg, $scope);
      }

      // change to a specific page
      $scope.changePage = function (pageNumber, provider) {
        if (pageNumber === 0 || pageNumber > $scope.tableConfig[provider].pages ||
          (pageNumber === $scope.tableConfig[provider].pages &&
            $scope.tableConfig[provider].pageNumber === pageNumber)) {
          return false;
        }
        $scope.tableConfig[provider].pageNumber = pageNumber;
        _search(provider);
      };

      $scope.tabChanged = function (provider) {
        $scope.tableConfig[provider].sortBy = 'updatedAt';
        $scope.tableConfig[provider].sortDir = 'desc';
        $scope.tableConfig[provider].pageNumber = 1;
        $scope.tableConfig[provider].initialized = false;
        _search(provider);
      };

      // get the number array that shows the pagination bar
      $scope.getPageArray = function (provider) {
        var res = [];

        var pageNo = $scope.tableConfig[provider].pageNumber;
        var i = pageNo - 5;
        for (i; i <= pageNo; i++) {
          if (i > 0) {
            res.push(i);
          }
        }
        var j = pageNo + 1;
        for (j; j <= $scope.tableConfig[provider].pages && j <= pageNo + 5; j++) {
          res.push(j);
        }
        return res;
      };

      // sort by criteria
      $scope.sort = function (criteria, provider) {
        if (criteria === $scope.tableConfig[provider].sortBy) {
          if ($scope.tableConfig[provider].sortDir === 'asc') {
            $scope.tableConfig[provider].sortDir = 'desc';
          } else {
            $scope.tableConfig[provider].sortDir = 'asc';
          }
        } else {
          $scope.tableConfig[provider].sortDir = 'asc';
        }
        $scope.tableConfig[provider].sortBy = criteria;
        $scope.tableConfig[provider].pageNumber = 1;
        _search(provider);
      };

      SettingService.userSetting($rootScope.currentUser.handle).then(function (response) {
        $log.log('logku');
        $log.log(response);
        if (response.data.expired.github) {
          Alert.error('Your Github token has expired. Please go to settings to renew your token', $scope);
        }
        if (response.data.expired.gitlab) {
          Alert.error('Your Gitlab token has expired. Please go to settings to renew your token', $scope);
        }
      });

    }]);
