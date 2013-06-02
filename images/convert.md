# Create new icons

Use the following shell command with graphicsmagick to create a new icon set:

`for i in 128 48 38 19 16; do gm convert -resize ${i}x${i} iconmonstr-note-27-icon.png icon${i}.png; done`

Use the following shell command to colorize an icon:

`gm convert iconmonstr-note-27-icon.png -fill red -colorize 40/40/10 icon-dev.png`