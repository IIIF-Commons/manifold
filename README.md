# manifold

[![Build Status](https://travis-ci.org/IIIF-Commons/manifold.svg?branch=master)](https://travis-ci.org/IIIF-Commons/manifold)

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

### Publishing Package

    git checkout master
    npm version patch
    git add .
    git commit -m "Release v1.2.3"
    git tag v1.2.3
    git push origin master v1.2.3

### tips

Use `nvm use 14` before installing anything
