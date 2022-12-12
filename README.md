# tyland-monitoring-backend
- A monitoring REST like API backend service.
- Basically uses HTTP GET method to retrive data back.

### GET
##### CPU
- /api/v1/cpu
- /api/v1/cpu/flags
- /api/v1/cpu/cache
- /api/v1/cpu/temperature

##### HARDWARE
- /api/v1/hardware
- /api/v1/hardware/baseboard
- /api/v1/hardware/chassis
- /api/v1/hardware/bios
- /api/v1/hardware/uuid

##### MEMORY
- /api/v1/memory
- /api/v1/memory/layout

##### GRAPHICS
- /api/v1/graphics

##### OS
- /api/v1/os
- /api/v1/os/shell
- /api/v1/os/versions
- /api/v1/os/users

##### Loading
- /api/v1/loading
- /api/v1/loading/full
- /api/v1/loading/process/:process_name
- /api/v1/loading/service/:service_name

##### Processes
- /api/v1/processes

##### Filesystem
- /api/v1/filesystem
- /api/v1/filesystem/disks
- /api/v1/filesystem/disks/io
- /api/v1/filesystem/blocks
- /api/v1/filesystem/openfiles
- /api/v1/filesystem/stats

##### USB
- /api/v1/usb

##### Printer
- /api/v1/printer

##### Network
- /api/v1/network
- /api/v1/network/default
- /api/v1/network/default/gateway
- /api/v1/network/stats
- /api/v1/network/connections
- /api/v1/network/check?target=XXX.XXX.XXX.XXX
- /api/v1/network/latency?target=XXX.XXX.XXX.XXX
