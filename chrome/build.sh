#!/bin/sh

HOST_FILES="manifest.json"
CWD=`pwd`
#KEY="/PATH/to/chrome_extension.pem"
KEY=$CWD/../../pathmarks.pem

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME" ]; then
echo error: ${CHROME} is not accessible
echo "hint: run this from your mac"
exit 1;
fi

if [ ! -f "$CWD/src/manifest.json" ]; then
echo "must be run from the chrome_extension directory"
exit 1;
fi

# build the crx file
mkdir -p "$CWD/build"
echo "compiling pathmarks.crx";
"$CHROME" --pack-extension=$CWD/src --pack-extension-key=$KEY --no-message-box
mv "$CWD/src.crx" "$CWD/build/pathmarks.crx"
echo "finished build/pathmarks.crx";
