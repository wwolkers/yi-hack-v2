#!/bin/sh

YI_HACK_PREFIX="/home"
YI_PREFIX="/home/app"

ARCHIVE_FILE="$YI_HACK_PREFIX/yi-hack/yi-hack.7z"
DESTDIR="$YI_HACK_PREFIX/yi-hack"

files=`find $YI_PREFIX -maxdepth 1 -name "*.7z"`
if [ ${#files[@]} -gt 0 ]; then
	/home/base/tools/7za x "$YI_PREFIX/*.7z" -y -o$YI_PREFIX
	rm $YI_PREFIX/*.7z
fi

if [ -f $ARCHIVE_FILE ]; then
	/home/base/tools/7za x $ARCHIVE_FILE -y -o$DESTDIR
	rm $ARCHIVE_FILE
fi

mkdir -p $YI_HACK_PREFIX/yi-hack/etc/dropbear

# Comment out all the cloud stuff from base/init.sh
sed -i 's/\t\.\/watch_process \&/\t#\.\/watch_process \&/g' /home/app/init.sh
sed -i 's/\t\.\/oss \&/\t#\.\/oss \&/g' /home/app/init.sh
sed -i 's/\t\.\/p2p_tnp \&/\t#\.\/p2p_tnp \&/g' /home/app/init.sh
sed -i 's/\t\.\/cloud \&/\t#\.\/cloud \&/g' /home/app/init.sh
sed -i 's/\t\.\/mp4record \&/\t#\.\/mp4record \&/g' /home/app/init.sh
