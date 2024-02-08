#!/bin/sh

esbuild source/index.ts --bundle --outfile=dist/bundle.js
cp ./source/index.html ./dist/index.html
mkdir -p ./dist/sounds
cp ./source/sounds/* ./dist/sounds/