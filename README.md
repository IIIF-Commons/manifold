# manifold

[![Build Status](https://travis-ci.org/IIIF-Commons/manifold.svg?branch=master)](https://travis-ci.org/IIIF-Commons/manifold)

Stateful utils on top of manifesto. Returns a `helper` object that can be used to navigate a IIIF manifest.

    npm install @iiif/manifold --save

Getting Started
--

### Documentation

https://iiif-commons.github.io/manifold/


### Developer Setup

    git clone https://github.com/iiif-commons/manifold.git
    npm install
    npm build
    npm test

### Publishing Package

1. Bump the version locally using `npm version` on a branch other than `master`. Example: `npm version patch -m 'bump to v3.0.42'`
1. Push the bump version branch to GitHub and create a pull request to `master`.
1. After the pull request is merged, checkout `master` and pull the latest changes. `git checkout master && git pull`
1. Run `npm publish`
1. Push the git tags created `git push --tags`