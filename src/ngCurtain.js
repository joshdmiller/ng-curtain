angular.module( 'ngCurtain', [] )

.directive( 'ctnCurtain', function( $window, $document, $location ) {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<ul class="curtains" ng-transclude></ul>',
    scope: true,
    controller: function ( $scope, $element ) {
      $scope.window = angular.element( $window );
      var sections = $scope.sections = [];
      var windowHeight;
      var bodyHeight;
      var currentSectionIdx;
      var body = $document.find( 'body' );

      // FIXME: only works on webkit
      var scrollEl = body;

      /**
       * Used by the child ctnSection elements to register themselves as
       * sections within this curtain.
       */
      this.addSection = function ( section ) {
        sections.push( section );
      };

      /**
       * Change the current section.
       */
      this.setCurrent = $scope.setCurrent = function ( idx ) {
        if ( ! angular.isDefined( idx ) ) {
          var path = $location.path();
          angular.forEach( sections, function forEachSectionCheckLocation ( section, index ) {
            if ( section.path === path ) {
              currentSectionIdx = index;
            }
          });
        } else {
          currentSectionIdx = idx;
        }

        var currSection = sections[ currentSectionIdx ];

        angular.forEach( sections, function forEachRemoveCurrent ( section ) {
          section.isCurrent = false;
          section.isHidden = true;
        });

        currSection.isCurrent = true;
        currSection.isHidden = false;
        $location.path( currSection.path );

        if ( sections.length > currentSectionIdx + 1 ) {
          sections[ currentSectionIdx + 1 ].isHidden = false;
        }
      };

      /**
       * Based on the height of the window and the height of each section, set
       * the height of all sections.
       */
      $scope.configureSections = function configureSections () {
        var height, zidx, levelHeight = 0;
        windowHeight = $scope.window.prop( 'innerHeight' );
        bodyHeight = 0;

        angular.forEach( sections, function forEachSection ( section, index ) {
          
          /**
           * Covers are always the height of the window, whereas all other
           * sections are at a minimum the height of the window.
           */
          if ( section.isCover ) {
            height = windowHeight;
          } else {
            height = section.getHeight();
            height = height <= windowHeight ? windowHeight : height;
          }

          // set the current top position of the curtain
          section.levelHeight = levelHeight;

          // set the positions and make it so!
          section.height = height;
          section.zIndex = 999 - index;
          section.setPosition();

          // increase the body height
          bodyHeight += parseInt( section.height, 10 );

          // increment the current top position by this one's height
          levelHeight += section.height;

        });

        // set the calculated body height so there's something to scroll
        body.css( 'height', bodyHeight + 'px' );
      };

      /**
       * Handle the scrolling.
       */
      $scope.handleScroll = function handleScroll () {
        var documentTop = body.prop( 'scrollTop' );
        var currSection = sections[ currentSectionIdx ];
        var currSectionPos = currSection.levelHeight;
        var currSectionHeight = currSection.height;

        /**
         * If we're scrolling up to a new section...
         */
        if ( documentTop < currSectionPos && currentSectionIdx > 0 ) {
          currSection.translate( 0 );
          $scope.setCurrent( currentSectionIdx - 1 );
        } 
        /**
         * If we're scrolling within the current section...
         */
        else if ( documentTop < ( currSectionPos + currSectionHeight ) ) {
          currSection.translate( -(documentTop - currSectionPos) );
        }
       /**
        * If we're scrolling down to a new section...
        */ 
        else {
          $scope.setCurrent( currentSectionIdx + 1 );
        }
      };

    },
    link: function link ( scope, element, attrs ) {
      scope.configureSections();
      scope.setCurrent();

      scope.window.bind( 'resize', function () { scope.$apply( scope.configureSections ); } );
      scope.window.bind( 'scroll', function () { scope.$apply( scope.handleScroll ); } );
    }
  };
})

.directive( 'ctnSection', function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<li class="curtains" ng-class="{ current: isCurrent, cover: isCover, hidden: isHidden }" ng-transclude></li>',
    scope: true,
    require: '^ctnCurtain',
    controller: function ( $scope, $element ) {

      $scope.setPosition = function setPosition () {
        if ( $scope.isCover ) {
          $element.css({
            minHeight: $scope.height + 'px',
            zIndex: $scope.zIndex
          });
        } else {
          $element.css({
            height: $scope.height + 'px',
            zIndex: $scope.zIndex
          });
        }
      };

      $scope.translate = function translate ( top ) {
        var prop = 'translateY('+top+'px) translateZ(0)';
        $element.css({
          transform: prop,
          '-webkit-transform': prop
        });
      };

      $scope.getHeight = function () {
        return $element.prop( 'offsetHeight' );
      };
    },
    link: function( scope, element, attrs, ctnCurtainCtrl ) {
      ctnCurtainCtrl.addSection( scope );
      scope.isCover = scope.$eval( attrs.ctnSectionCover );
      scope.path = '/' + attrs.ctnSection;
    }
  };
})

;

