(function (window, angular, undefined) {
  angular.module('ngCurtain', []).directive('ctnCurtains', [
    '$window',
    '$document',
    '$location',
    function ($window, $document, $location) {
      return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template: '<ul class="ctn-curtains" ng-transclude></ul>',
        scope: true,
        controller: [
          '$scope',
          '$element',
          function ($scope, $element) {
            $scope.window = angular.element($window);
            var sections = $scope.sections = [];
            var windowHeight;
            var bodyHeight;
            var currentSectionIdx;
            var body = $document.find('body');
            $scope.locationChangeFromScroll = false;
            this.addSection = function (section) {
              sections.push(section);
            };
            this.setCurrent = $scope.setCurrent = function (idx) {
              currentSectionIdx = idx || 0;
              var currSection = sections[currentSectionIdx];
              angular.forEach(sections, function forEachRemoveCurrent(section) {
                section.isCurrent = false;
                section.isHidden = true;
              });
              currSection.isCurrent = true;
              currSection.isHidden = false;
              $location.path(currSection.path);
              if (sections.length > currentSectionIdx + 1) {
                sections[currentSectionIdx + 1].isHidden = false;
              }
            };
            $scope.scrollTo = function scrollTo() {
              var path = $location.path();
              angular.forEach(sections, function forEachSectionCheckLocation(section, index) {
                if (section.path === path) {
                  currentSectionIdx = index;
                }
              });
              currentSectionIdx = currentSectionIdx || 0;
              $scope.setCurrent(currentSectionIdx);
              $scope.window[0].scroll(0, sections[currentSectionIdx].levelHeight);
              angular.forEach(sections, function forEachSectionCheckLocation(section, index) {
                if (index < currentSectionIdx) {
                  section.translate(-section.height);
                }
              });
            };
            $scope.configureSections = function configureSections() {
              var height, zidx, levelHeight = 0;
              windowHeight = $scope.window.prop('innerHeight');
              bodyHeight = 0;
              angular.forEach(sections, function forEachSection(section, index) {
                height = section.getHeight();
                section.levelHeight = levelHeight;
                section.height = height;
                section.zIndex = 999 - index;
                section.setHeight(windowHeight);
                bodyHeight += parseInt(section.height, 10);
                levelHeight += parseInt(section.height, 10);
              });
              body.css('height', bodyHeight + 'px');
            };
            $scope.handleScroll = function handleScroll() {
              var documentTop = $scope.window.prop('pageYOffset');
              var currSection = sections[currentSectionIdx];
              var currSectionPos = currSection.levelHeight;
              var currSectionHeight = currSection.height;
              if (documentTop < currSectionPos && currentSectionIdx > 0) {
                currSection.translate(0);
                $scope.locationChangeFromScroll = true;
                $scope.setCurrent(currentSectionIdx - 1);
              } else if (documentTop < currSectionPos + currSectionHeight) {
                currSection.translate(-(documentTop - currSectionPos));
              } else {
                $scope.locationChangeFromScroll = true;
                $scope.setCurrent(currentSectionIdx + 1);
              }
            };
          }
        ],
        link: function link(scope, element, attrs) {
          scope.configureSections();
          scope.scrollTo();
          scope.window.bind('resize', function () {
            scope.$apply(scope.configureSections);
          });
          scope.window.bind('scroll', function () {
            scope.$apply(scope.handleScroll);
          });
          scope.$on('$locationChangeSuccess', function locationChangeSuccessHandler(path) {
            if (!scope.locationChangeFromScroll) {
              scope.scrollTo(path);
            }
            scope.locationChangeFromScroll = false;
          });
        }
      };
    }
  ]).directive('ctnCurtain', function () {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      template: '<li class="ctn-curtain" ng-class="{ current: isCurrent, cover: isCover, hidden: isHidden }" ng-transclude></li>',
      scope: true,
      require: '^ctnCurtains',
      controller: [
        '$scope',
        '$element',
        function ($scope, $element) {
          $scope.setHeight = function setHeight(minHeight) {
            if ($scope.isCover || $scope.height < minHeight) {
              $scope.height = minHeight;
              $element.css('height', $scope.height + 'px');
            } else {
              $element.css('min-height', $scope.height + 'px');
            }
            $element.css('z-index', $scope.zIndex);
          };
          $scope.translate = function translate(top) {
            var prop = 'translateY(' + top + 'px)';
            $element.css({
              transform: prop,
              '-webkit-transform': prop,
              '-moz-transform': prop
            });
          };
          $scope.getHeight = function () {
            return $element.prop('offsetHeight');
          };
        }
      ],
      link: function (scope, element, attrs, ctnCurtainsCtrl) {
        ctnCurtainsCtrl.addSection(scope);
        scope.isCover = scope.$eval(attrs.ctnCover);
        scope.path = '/' + attrs.ctnCurtain;
      }
    };
  });
  ;
}(window, window.angular));