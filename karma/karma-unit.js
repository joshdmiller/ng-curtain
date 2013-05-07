// From where to look for files
basePath = '../';

// List of file patterns to load into the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'vendor/angular-unstable/angular.js',
  'vendor/angular-mocks/angular-mocks.js',
  'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
  'src/**/*.js'
];

reporters = 'dots';

port = 9018;
//runnerPort = 9100;
urlRoot = '/';

// Log at a very low level, but not quite debug.
logLevel = LOG_INFO;

// Disable file watching by default.
autoWatch = false;

browsers = [];

