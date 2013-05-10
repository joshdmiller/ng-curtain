# [ngCurtain](http://joshdmiller.github.io/ng-curtain)

A set of pure AngularJS directives to create a wicked-cool "rising curtain"
effect to unroll the sections of your website.

***

## Usage

### 1. Install It

ngCurtain is available through Bower, so this is by far the easiest way to
obtain it. Just run:

```sh
$ bower install --save-dev ng-curtain
```

This will download the latest version of ngCurtain and install it into your
Bower directory (defaults to components). Boom!

### 2. Incorporate It

Now you have to add the script file to your application. You can, of course,
just add a script tag. If you're using ngBoilerplate or any of its derivatives,
simply add it to the `vendor.js` array of your `Gruntfile.js`:

```js
vendor: {
  js: [
    // ...
    'vendor/ng-curtain/ng-curtain.min.js',
    // ...
  ]
},
```

However you get it there, as soon as it's in your build path, you need to tell
your app module to depend on it:

```js
angular.module( 'myApp', [ 'ngCurtain', /* other deps */ ] );
```

Also be sure to include the stylesheet. In ngBoilerplate, simply import
`ng-curtain.less` into your `main.less` file.

Now you're ready to go! Sweet.

### 3. Use It

The markup for ngCurtain is fairly straightforward. There are two directives:
`ctnCurtains` and `ctnCurtain`. The former is the main directive and wraps all
content, accepting within it as many of the latter as necessary, each
representing a separate curtain whose position to manage. Both can be used
either as elements or as attributes.

For example, the typical structure of ngCurtain therefore looks something like
this:

```html
<ctn-curtains>
  <div ctn-curtain="first-section" ctn-cover="true">
    <!-- content here... -->
  </div>
  <div ctn-curtain="second-section">
    <!-- content here... -->
  </div>
  <div ctn-curtain="third-section">
    <!-- content here... -->
  </div>
  <div ctn-curtain="fourth-section">
    <!-- content here... -->
  </div>
</ctn-curtains>
```

## How it Works

If you're just interested in using ngCurtain, you can ignore this section
completely. But for those curious, this section contains an overview of how the
code works.

The outer directive (`ctnCurtains`) contains the vast majority of the logic as
methods on its scope. The inner directives (`ctnCurtain`) require the outer
directive and call a method during their linking phase to register their
presence.

After initialization of all the children, `ctnCurtains` calculates the positions
of all the individual ctnCurtain elements that registered themselves, calculates
the total window height, and determines which curtains to start where based on
the current value of `$location.path()`. This same process is repeated every
time the window is resized.

Technically, all cards start positioned at 0,0 and the window's height is
manually calculated and applied as the sum of the heights of the individual
curtains.

When the browser window scrolls, the ctnCurtains directive determines whether we
are scrolling within a curtain, beyond a curtain, or above a curtain and
arranges the positions and stacks appropriately and applies translateY
operations to change the current vertical position of the curtain relative to
the current (virtual) scroll position. That probably sounds confusing, but if
you look at the code, it's pretty straightforward.

## Contributing

Contributions are encouraged! There is a lot to be done.

## Shameless Self-Promotion

Like ngCurtain? Star this repository to let me know! If this got you particulary
tickled, you can even follow me on [GitHub](http://github.com/joshdmiller),
[Twitter](http://twitter.com/joshdmiller),
[Google+](http://gplus.to/joshdmiller), or
[LinkedIn](http://linkedin.com/in/joshdmiller).

Enjoy.

