# Create and colorize icons

Use the following shell commands with graphicsmagick ('brew install graphicsmagick') to create a new icon set.

Icons colorized for development:

`gm convert iconmonstr-bookmark.png -fill "rgb(151,25,40)" -colorize 100/100/100 icon-dev.png`

Icons colorized for production:

`gm convert iconmonstr-bookmark.png -fill "rgb(80,80,80)" -colorize 100/100/100 icon-grey.png`

Use the following commands to create the different icon sizes.

Icons for production:

`for i in 128 48 38 19 16; do gm convert -resize ${i}x${i} icon-grey.png icon${i}.png; done`

Icons for development:

`for i in 128 48 38 19 16; do gm convert -resize ${i}x${i} icon-dev.png icon-dev${i}.png; done`
