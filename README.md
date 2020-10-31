[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]

dicomParser
===========

dicomParser is a lightweight library for parsing DICOM P10 byte streams in modern HTML5 based web browsers (IE10+),
Node.js and Meteor.  dicomParser is fast, easy to use and has no required external dependencies.

Live Examples
---------------

The best way to see the power of this library is to actually see it in use.  A number of live examples are
included that are not only useful but also show how to use dicomParser.
[Click here for a list of all live examples](https://rawgithub.com/cornerstonejs/dicomParser/master/examples/index.html)
Make sure you try out the [DICOM Dump with Data Dictionary](https://rawgit.com/cornerstonejs/dicomParser/master/examples/dumpWithDataDictionary/index.html)
which is a very useful tool and excellent example of most features.

Community
---------

Have questions?  Try posting on our [google groups forum](https://groups.google.com/forum/#!forum/cornerstone-platform).


Install
-------

Get a packaged source file:

* [dicomParser.js](https://unpkg.com/dicom-parser@latest/dist/dicomParser.js)
* [dicomParser.min.js](https://unpkg.com/dicom-parser@latest/dist/dicomParser.min.js)

Or install via [NPM](https://www.npmjs.com/):

> npm install dicom-parser

Or install via atmosphere for [Meteor](https://www.meteor.com/) applications

> meteor add chafey:dicom-parser

* Note - make sure you install [pako](https://github.com/nodeca/pako) if you need to support
the Deflated Explicit VR Little Endian transfer syntax

Usage
-----

```
// create a Uint8Array or node.js Buffer with the contents of the DICOM P10 byte stream
// you want to parse (e.g. XMLHttpRequest to a WADO server)
var arrayBuffer = new ArrayBuffer(bufferSize);
var byteArray = new Uint8Array(arrayBuffer);

try
{
   // Parse the byte array to get a DataSet object that has the parsed contents
    var dataSet = dicomParser.parseDicom(byteArray/*, options */);

    // access a string element
    var studyInstanceUid = dataSet.string('x0020000d');

    // get the pixel data element (contains the offset and length of the data)
    var pixelDataElement = dataSet.elements.x7fe00010;

    // create a typed array on the pixel data (this example assumes 16 bit unsigned data)
    var pixelData = new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
}
catch(ex)
{
   console.log('Error parsing byte stream', ex);
}
```

[See the live examples for more in depth usage of the library](https://rawgithub.com/cornerstonejs/dicomParser/master/examples/index.html)

Note that actually displaying DICOM images is quite complex due to the variety of pixel formats and compression
algorithms that DICOM supports.  If you are interested in displaying images, please take a look at the
[cornerstone library](https://github.com/cornerstonejs/cornerstone) and the
[cornerstoneWADOImageLoader](https://github.com/cornerstonejs/cornerstoneWADOImageLoader) which uses this
library to extract the pixel data from DICOM files and display the images with
[cornerstone library](https://github.com/cornerstonejs/cornerstone).
You can find the actual code that extracts grayscale pixel data using this library
[here](https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/master/src/makeGrayscaleImage.js).

Options
-------

```dicomParser.parseDicom``` accepts an optional second argument that is an options object. The accepted properties are:

#### untilTag

A tag in the form xggggeeee (where gggg is the hexadecimal group number and eeee is the hexadecimal element number,
e.g. 'x7fe00010') that specifies the final tag to parse. Any tags occurring after this in the file will be ignored.
Useful for partial reading of byte streams.

#### vrCallback

A callback that, given a tag, will return the two-character Value Representation associated with that tag (see PS 3.5
of the DICOM standard for more information). It may return undefined to indicate that the VR was not provided.

#### inflater

A callback that given the underlying byteArray and position of the deflated buffer returns a byteArray containing the
DICOM P10 header and inflated data set concatenated together.

Key Features
------------

* Parses all known valid DICOM Part 10 byte arrays
  * Explicit and implicit
  * Little endian and big endian
  * Deflated Explicit VR Little Endian transfer syntax
    * Uses zlib when running node.js
    * requires [pako](https://github.com/nodeca/pako) in web browsers
    * has callback to support use of other inflate libraries
* Supports all VR's including sequences
* Supports elements with undefined length
* Supports sequence items with undefined length
* Provides functions to convert from all VR types to native Javascript types
* Does not require a data dictionary
* Designed for use in the browser
* Each element exposes the offset and length of its data in the underlying byte stream
* Packaged using the module pattern, as an AMD module and as a CommonJS module for Node.js
* No external dependencies
* Supports extraction of encapsulated pixel data frames
  * Basic Offset Table decoded
  * Fragments decoded
  * Function to extract image frame when basic offset table is present
  * Function to extract image frame from fragments when no basic offset table is present
* Convenient utility functions to parse strings formatted in DA, TM and PN VRs and return JavaScript objects
* Convenient utility function to create a string version of an explicit element
* Convenient utility function to convert a parsed explicit dataSet into a javascript object
* Convenient utility function to generate a basic offset table for JPEG images
* Supports reading incomplete/partial byte streams
  * By specifying a tag to stop reading at (e.g. parseDicom(byteArray, {untilTag: "x7fe00010"}); )
  * By returning the elements parsed so far in the exception thrown during a parse error (the elements parsed will be
    in the dataSet property of the exception)
* Supports reading from Uint8Arrays and Node.js Buffers

Build System
============

This project uses Webpack to build the software.

Pre-requisites:
---------------

NodeJs - [click to visit web site for installation instructions](http://nodejs.org).

Common Tasks
------------

Update dependencies (after each pull):
> npm install

Running the build:
> npm run build

Automatically running the build and unit tests after each source change:
> npm run watch

## Publish

This library uses `semantic-release` to publish packages. The syntax of commits against the `master` branch
determine how the new version calculated.

<table>
  <tr>
    <th>Example Commit</th>
    <th>Release Type</th>
  </tr>
  <tr>
    <td>fix(pencil): stop graphite breaking when too much pressure applied</td>
    <td>Patch Release</td>
  </tr>
  <tr>
    <td>feat(pencil): add 'graphiteWidth' option</td>
    <td>Feature Release</td>
  </tr>
  <tr>
    <td>
      perf(pencil): remove graphiteWidth option<br />
      <br />
      BREAKING CHANGE: The graphiteWidth option has been removed. 
      The default graphite width of 10mm is always used for performance reasons.
    </td>
    <td>
      Major Breaking Release
    </td>
  </tr>
</table>


Backlog
------------

Future:

* Add unit tests for sequence parsing functionality and encapsulated pixel frames
* Figure out how to automatically generate documentation from the source (jsdoc)
* Optimize findItemDelimitationItemAndSetElementLength() for speed
* Optimize functions in byteArrayParser.js for speed
* Add example that allows you to compare two sop instances against each other
* Figure out how to not have a global dicomParser object when used with an AMD loader
* See what needs to be done to support different character sets (assumes ASCII currently)
* Support for parsing from streams on Node.js and Meteor
* Switch to JavaScript ES6
* Separate the parsing logic from the dataSet creation logic (e.g. parsing generates events
  which dataSet creation logic creates the dataSet from).  Similar concept to SAX parsers.
  * dataSet creation logic could filter out unwanted tags to improve performance of parse
  * dataSet creation logic could defer creation of sequence dataSets to improve performance of parse
* Function to parse non P10 byte streams given the byte stream and the transfer syntax
* Support for encrypted dicom

Contributors
============================================

* @neandrake for help with getting Node.js support
* @ggerade for implementing support for floats/doubles with VM > 1
* @yagni for bug fix related to parsing implicit little endian files and big endian support
* @snagytx, @doncharkowsky - for bug fix related to reading encapsulated frames
* @bbunderson, @jpambrun - bug fix for reading encapsulated frames
* @henryqdineen, adil.tiadi@gmail.com - bug report for sequences with undefined lengths and zero items
* @swederik - bug fixes on sequences with undefined lengths and zero items
* @jkrot - performance enhancement in byteArrayParser
* @cancan101 - issue related to multi-frame with multiple fragments and no basic offset table

Why another Javascript DICOM parsing library?
============================================

While building the WADO Image Loader for [cornerstone](https://github.com/cornerstonejs/cornerstone), I couldn't find a Javascript DICOM parser that exactly met
my needs.  DICOM really isn't that hard to parse so I figured I would just make my own.  Here are some of the key things that I
really wanted out of a DICOM library that I am hoping to deliver:

* License is extremely liberal so it could be used in any type of project
* Only deals with parsing DICOM - no code to actually display the images
* Designed to work well in a browser (modern ones at least)
* Follows modern javascript best practices
* Has documentation and examples on how to use it
* Does not hide the underlying data stream from you
* Does not require a data dictionary
* Decodes individual elements "on demand" - this goes with not needing a data dictionary
* Code guards against corrupt or invalid data streams by sanity checking lengths and offsets
* Does not depend on any external dependencies - just drop it in and go
* Has unit tests
* Code is easy to understand

Interested in knowing why the above goals are important to me?  Here you go:

_License is extremely liberal so it could be used in any type of project_

DICOM is an open standard and parsing it is easy enough that it should be freely available for
all types of products - personal, open source and commercial.  I am hoping that the MIT license
will help it see the widest possible adoption (which will in the end help the most patients).
I will dual license it under GPL if someone asks.

_Only deals with parsing DICOM - no code to actually display the images_

I am a big believer in small reusable pieces of software and loose coupling.  There is no reason to
tightly couple the parser with image display.  I hope that keeping this library small and simple will
help it reach the widest adoption.

_Designed to work well in a browser (modern ones at least)_

There are some [good javascript DICOM parsing libraries](https://github.com/grmble/node-dicom) available for server development on node.js but they
won't automatically work in a browser.  I needed a library that let me easily parse WADO responses and
I figured others would also prefer a simple library to do this with no dependencies.
The library does make use of the [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBuffer)
object which is widely supported except for IE (it is available on IE10+).  I have no current plans to add support
for older versions of IE but would be open to contributions if someone wants to do the work.

_Follows modern javascript best practices_

This of course means different things to different people but I have found great benefit from making sure
my javascript passes [jshint](http://www.jshint.com/) and leveraging the
[module pattern](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html).  I also have a great affinity to
[AMD modules](http://requirejs.org/docs/whyamd.html) but I understand that not everyone wants to use them.
So for this library I am shooting for simply making sure the code uses the module pattern and passes jshint.

_Has documentation and examples on how to use it_

Do I really need to convince you that this is needed?

_Does not hide the underlying data stream from you_

I have used many DICOM parsing libraries over the years and most of them either hide the underlying byte stream
from you or make it difficult to access.  There are times when you need to access the underlying bytes  - and
it is frustrating when the library works against you.  A few examples of the need for this include
UN VR's, private attributes, encapsulated pixel data and implicit little endian transfer
syntaxes (which unfortunately are still widely being used) when you don't have a complete data dictionary.

This library addresses this issue by exposing the offset and length of the data portion of each
 element.  It also defers parsing (and type converting) the data until it is actually asked to do so.
 So what you get from a parse is basically a set of pointers to where the data for each element is in the
byte stream and then you call the function you want to extract the type you want.  An awesome side
effect of this is that you don't need a data dictionary to parse a file even if it uses implicit
little endian.  It also turns out that parsing this way is very fast as it avoids doing unneeded type conversions.

Note that you cannot 100% reliably parse sequence elements in an implicit little endian
transfer syntax without a data dictionary.  I therefore *strongly* recommend that you work with explicit transfer
syntaxes whenever possible.  Fortunately most Image Archives should be able to give you an explicit
transfer syntax encoding of your sop instance even if it received it in implicit little endian.

Note that WADO's default transfer syntax is explicit little endian so one would assume that an
Image Archive supporting WADO would have a good data dictionary management system.
Initially I wasn't going to support parsing of implicit data at all but decided to mainly for
convenience (and the fact that many of my test data sets are in little endian transfer syntax and I am too
lazy to convert them to explicit transfer syntax).

_Does not require a data dictionary_

As a client, you usually you know which elements you want to access and know what type they are so designing a
client oriented parser around a data dictionary is adding unnecessary complexity, especially if you can stick to
explicit transfer syntaxes.  I also believe it is the the server's responsibility to provide the client
 safe and easily digestable data (i.e. explicit transfer syntaxes).  A server typically supports
many types of clients so it makes sense to centralize data dictionary management in one place rather
than burden each client with it.

Data dictionaries are not required for most client use cases anyway so I decided not to support it in this library
at all.  For those use cases that do require a data dictionary, you can layer it on top of this library.  An example
of doing so is provided in the live examples.  If you do want to know the VR, request the instance in an
explicit transfer syntax and you can have it.  If your Image Archive can't do this for you, get a new one - seriously.

_Decodes individual elements "on demand" - this goes with not needing a data dictionary_

See above, this is related to not requiring a data dictionary.  Usually you know exactly what elements you need
and what their types are.  The only time this is not the case is when you are building a DICOM Dump utility or
you can't get an explicit transfer syntax and have one of those problematic elements that can be either OB or OW (and you
can _usually_ figure out which one it is without the VR anyway)

_Code guards against corrupt or invalid data streams by sanity checking lengths and offsets_

Even though you would expect an Image Archive to _never_ send you data that isn't 100% DICOM compliant,
that is not a bet I would make.  As I like to say - there is no "DICOM police" to penalize vendors
who ship software that creates bytes streams that violate the DICOM standard.  Regardless, it is good
practice to never trust data from another system - even one that you are in full control of.

_Does not depend on any external dependencies - just drop it in and go_

Sort of addressed above as maximizing adoption requires that the library minimize the burden on its users.  I did
find a few interesting libraries that were targeted at making it easier and safer to parse byte streams but
they just seemed like overkill so I decided to do it all in one to keep it as simple as it could be.  In general
I am a big fan of building complex systems from lots of smaller simpler pieces.  Some good
references on this include the [microjs site](http://microjs.com/#) and the
[cujo.js manifseto](http://cujojs.com/manifesto.html)

_Has unit tests_

I generally feel that units tests are _often_ a waste of time for front end development.  Where unit tests do make sense
is code that is decoupled from the user interface - like a DICOM parsing module.  I did use
[TDD](http://en.wikipedia.org/wiki/Test-driven_development) on this project and had unit tests
covering ~ 80% of the code paths passing before I even tried to load my first real DICOM file.  Before I wrote
this library, I did a quick prototype without unit tests that actually took me much less time
(writing tests takes time....).   So in the end I don't think it saved me much time getting to a first release,
but I am hoping it will pay for itself in the long run (especially if this library receives wide adoption).
I also know that some people out there won't even look at it unless it has good test coverage.

Interesting note here - I did not write unit tests for sequence parsing and undefined lengths mainly because I found
the standard difficult to understand in these areas and didn't want to waste my time building tests that were not
correct.  I ended up making these work by throwing a variety of data sets at it and fixing the issues that I found.
Getting this working took about 3x longer than everything else combined so perhaps it would have been faster if I had
used TDD on this part.

_Code is easy to understand_

In my experience, writing code that is easy to understand is *far more important* than writing documentation or unit
tests for that code.  The reason is that when a developer needs to fix or enhance a piece of code, they _almost never_
start with the unit tests or documentation - they jump straight into the code and start thrashing about in the debugger.
If some other developer is looking at your code, you probably made a mistake - either a simple typo or a design issue if you
really blew it.  In either case, you should have mercy on them in advance and make their unenviable task of fixing
or extending your code the best it can be.  Some principles I try to follow include:

* Clear names for source files, functions and variables.  These names can get very long but I find that doing so is
better than writing comments in the source file
* Small source files.  Generally I try to keep each source file to under 300 lines or so.  The longer it gets, the
harder it is to remember what you are looking at
* Small functions.  The longer the function is, the harder it is to understand

You can find out more about this by googling for "self documenting code"

In the Wild
===========

- [VS Code: DICOM Dump Extension](https://github.com/smikitky/vscode-dicom-dump)

Copyright
============
Copyright 2016 Chris Hafey [chafey@gmail.com](mailto:chafey@gmail.com)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/dicom-parser
[npm-version-image]: http://img.shields.io/npm/v/dicom-parser.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/dicom-parser.svg?style=flat

[travis-url]: http://travis-ci.org/cornerstonejs/dicomParser
[travis-image]: https://travis-ci.org/cornerstonejs/dicomParser.svg?branch=master

[coverage-url]: https://coveralls.io/github/cornerstonejs/dicomParser?branch=master
[coverage-image]: https://coveralls.io/repos/github/cornerstonejs/dicomParser/badge.svg?branch=master
