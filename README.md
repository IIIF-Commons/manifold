# manifold

[![Build Status](https://github.com/IIIF-Commons/manifold/actions/workflows/build-test.yml/badge.svg?branch=main)](https://github.com/IIIF-Commons/manifold/actions/workflows/build-test.yml)

    npm install @iiif/manifold --save

Stateful utils on top of manifesto. Returns a `helper` object that can be used to navigate a IIIF manifest.

e.g.

- `getMetadata`: returns all metadata for current image, range, canvas, sequence, manifest)
- `getCurrentRange`, `getPreviousRange`, `getNextRange`: Used to navigate a flattened range tree (useful for IIIF AV scenarios)
- `getTree`: Returns a default tree (sortable by `navDate`) of collections, manifests, ranges, or a tree based on a given top range.

Has an ajax implementation of manifesto's `IExternalResource` (used in the IIIF auth flow).

## Getting Started

### Documentation

https://iiif-commons.github.io/manifold/

### Developer Setup

    git clone https://github.com/iiif-commons/manifold.git
    npm install
    npm run build

### Testing the build
The build can be run and tested in the browser console by running

    npm start

and navigating to examples/index.html.

### Publishing Package

    git checkout main
    npm version patch
    npm run docs
    git add .
    git commit -m "Release v1.2.3"
    git tag v1.2.3
    git push origin main v1.2.3
