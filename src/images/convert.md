# Create and colorize icons

Use the following shell commands with graphicsmagick ('brew install graphicsmagick') to create a new icon set.

Icons colorized for default state:

`gm convert iconmonstr-bookmark.png -fill "rgb(80,80,80)" -colorize 100/100/100 icon-grey.png`

Icons colorized active state:

`gm convert iconmonstr-bookmark.png -fill "rgb(40,90,210)" -colorize 100/100/100 icon-active.png`

Use the following commands to create the different icon sizes.

Icons for default state:

`for i in 128 48 38 19 16; do gm convert -resize ${i}x${i} icon-grey.png icon${i}.png; done`

Icons for active state:

`for i in 128 48 38 19 16; do gm convert -resize ${i}x${i} icon-active.png icon-active-${i}.png; done`
