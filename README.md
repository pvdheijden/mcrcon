Remote connection client for minecraft servers
==============================================

Forked from [Tiffi's mcrcon repository](https://github.com/pvdheijden/mcrcon) (see tiffi folder) Added gyp based build
support. Original software is build with npm which kicks-off [node-gyp](https://github.com/TooTallNate/node-gyp) to
generate the makefile and build the client.
```
cd tiffi && npm install
```

## Setup

## Test
```
PASSWORD=<rcon-password> DEBUG=mcrcon:* grunt test
```




