Use Xiaomi Yi Ants Camera 2 (EU) in combination with ioBroker to send motion or baby cry detections (baby monitor) as videos to Telegram.
=======

![Alt text](telegram_yi_camera.png?raw=true "FTP Events")

this is based on the out dated yi-hack-v2 project (http://github.com/niclet/yi-hack-v2.git)


Purpose
=======

This project is a collection of scripts and binaries file to use your Xiaomi Yi Ants Camera 2 in combination with ioBroker.

![Alt text](yi-v2.png?raw=true "Yi Ants Camera 2")

This camera has the default following features :
* wifi
* motion detection : a video file is generated if a motion have been detected in the last 60 seconds.
* baby cry detection : a video file is generated if a baby cry have been detected in the last 60 seconds.
* send video data over the network on Chinese servers in the cloud to allow people to view camera data from their smartphone wherever they are.
* setup thanks to a smartphone application.
* local video storage on a SD card
* RTSP server

This hack includes :
* Base firmware : 2.1.1_20171024151200 EU (Check with app if your device has the same firmware, if not replace)
* Telnet server activated
* FTP server activated
* ssh server


Installation on the YI camera
=============================

The memory card must stay in the camera ! If you remove it, the camera will start without using the hack.

Prepare the memory card
-----------------------

Clone this repository on a computer :

    git clone https://github.com/bompo/yi-hack-v2
    
Then, format a micro SD card in fat32 (vfat) format and copy the content of the **yi-hack-v2/sd/** folder at the root of your memory card.

The memory card will so contain :

* home.bin : the official firmware file compliant with EU model
* test : the folder which contains the hack scripts and binaries

Replace your wifi settings in test/wpa_supplicant.conf and your firmware if needed.

Start the camera
----------------

* If plugged, unplug the Yi camera
* Insert the memory card in the Yi camera
* Plug the Yi camera
* Follow instructions to pair with your mobile app. This is only needed the first time.

The camera will start. The led will indicate the current status :
* yellow : camera startup
* blue blinking : network configuration in progress (connect to wifi, set up the IP address)
* blue : network configuration is OK. Camera is ready to use.


Use the camera
==============

FTP server
----------

The FTP server is on port 21.

No authentication is needed, you can use anonymous user.


Use with ioBroker
=============

Simply check the FTP Server for file changes in:

ftp://IP_ADDRESS/tmp/eventd/event_child_cry.mp4 to check for baby cry

or

ftp://IP_ADDRESS/tmp/eventd/event_motion.mp4 to check for movements

![Alt text](ftp_folder.png?raw=true "FTP Events")

See the script in iobroker/SendMessageToTelegramIfBabyCryDetected.js to check how it can be used to send baby cries to telegram with ioBroker. You need to install the Telegram Adapter and activate a bot as well.

You need the following npm modules enabled: jsftp, fs, path
![Alt text](js_modules.png?raw=true "FTP Events")


How it works ?
==============

Hack content
------------

````
home.bin                       Official firmware 2.1.1_20171024151200
test/                          Yi hack folder
  factory_test.sh              This script is called on camera startup and will launch all the needed processes
  logs/
    factory_test.log           Log file of the hack (filled by factory_test.sh)
  v2/
    audio/
      fr/
        *                      French voice files
    bin/
      libyihackv2.so           Native library to provide hacked features
      tcpsvd                   TCP Service Daemon (http://smarden.org/ipsvd/index.html) to launch FTP Server (ftpd)
    scripts/
      capture.sh               This script lets capture a single frame as a JPG file
      led.sh                   This script lets manipulate the led state
      startup_modified.sh      This script is called from factory_test.sh when MODIFIED startup (aka RTSP server) is activated
      startup_official.sh      This script is called from factory_test.sh when OFFICIAL startup is activated
  wpa_supplicant.conf          This config file must be correctly filled to connect the camera to your wifi network when RTSP feature is enabled
  yi-hack-v2.cfg               This config file lets you tune up various behaviors
````


factory_test.sh
---------------


Telnet server
-------------

The telnet server is on port 23.

No authentication is needed, default user is root.


RTSP server
-----------
To activate the RTSP server, you need to modify **test/yi-hack-v2.cfg** and uncomment the line YI\_HACK\_STARTUP\_MODE=MODIFIED

You must also modify **test/wpa_supplicant.conf** to be compliant with your own wifi network.

Please note that when you activate RTSP server, you can't use your mobile app anymore.

During camera startup, the led will indicate the current status :
* yellow : camera startup
* blue blinking : network configuration in progress (connect to wifi, set up the IP address)
* blue : network configuration is OK. Camera is ready to use.
* red : network configuration is KO. You should check your **test/wpa_supplicant.conf** file.

Main stream is available from rtsp://\<IP\>/stream1

A secondary MJPEG stream is also available from rtsp://\<IP\>/stream2

Following **hostmit** suggestion, you can now use **test/v2/scripts/capture.sh** to capture a single frame as a JPG file.


How can I know which is the version of a firmware 'home.bin' file ?
===============================================================

Just do : **strings home.bin | grep YUNYI_VERSION**. Example :

    $ strings home.bin | grep YUNYI_VERSION
    YUNYI_VERSION=2.1.1_20160429113900


