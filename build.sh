#!/bin/bash

if ! [[ "$BRANCH" =~ ^(master|develop)$ ]]; then
    echo "This script is unsafe to run manually."
    exit 1
fi


BRANCH=$BRANCH
BUILD=build.$BRANCH

# This isn't critical but ensures git-pull in the cloned repo happens quickly
git checkout $BRANCH
git pull

# Create a clone of the repo and ensure it's _still_ on the right branch
mkdir $BUILD && cd $BUILD
git clone .. .
git checkout $BRANCH
git pull
ln -s ../node_modules

# Build the site
npm run webpack
ln -s ../assets dist/assets

# Return to the top-level directory and move the new site into place
cd ..
rm -rf $BRANCH
mv $BUILD/dist $BRANCH
rm -rf $BUILD

