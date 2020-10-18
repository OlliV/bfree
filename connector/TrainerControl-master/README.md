# Read data and control a bike trainer

This is a server application allowing to read data from ANT+ devices and
sending them over to a TCP connection.  It can currently read heart rate from
an ANT+ HRM and read power, speed and cadence from an ANT+ FE-C trainer (most
recent trainers support this).  It can also control the resistance of the
trainer by setting the slope.

This application is written as back end server for a
[Racket](https://www.racket-lang.org) based front end, as described in [this
blog post](https://alex-hhh.github.io/2017/11/bike-trainer.html).  This is a
prototype application for a hobby project, and as such:

* It runs on Windows only, using Visual Studio 2017 to compile it.  While it
  could be ported to Linux easily, I have no short term plans of doing so.
* It uses C++ 17 features and there are no plans to support older C++
  compilers and standards.
* The network protocol for the telemetry is only intended for the front end
  application and may change at any time, with no backwards compatibility
  considerations.

## Building the application

The application is built on a Windows platform using Visual Studio 2017 (the
Community Edition will work fine).  It could be easily ported to Linux as
well, but this hasn't been done yet.

You will need to install **libusb** using
[vcpkg](https://github.com/Microsoft/vcpkg), see that projects instructions on
how to install it.

Open the `vs2017/TrainerControl.sln` solution and build it (if you opened it
before setting up the environment variables, you will need to re-open it).

The resulting executable will be in the `Debug` or `Release` folder.

## Running the application

To run the application, open a command window and type:

    ./TrainerControl.exe

The application will try to find the ANT+ USB stick and connect to the heart
rate monitor and bike trainer.  It will also accept TCP connections on port
7500.
