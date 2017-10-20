![Docker Build Status](https://img.shields.io/docker/build/clma/pi-neosegment-api.svg)

# Web API for the Neosegment display

Buy here: https://www.crowdsupply.com/maksmakes/neosegment 

## Usage

`sudo docker run -d --privileged  -p 3000:3000 -v ~/pi-neosegment-api/config.toml:/app/config.toml clma/pi-neosegment-api` 


### Web API
Spell 'hello' in random colors every 3 seconds 👍
`while true
    set color (random)
    curl -g "http://myhost.com:3000/api/v1/display/write?text=Hello&colors=[$color,$color,$color,$color,$color]&timeout=0"
    sleep 3
end
`

#### API parameters

Only `GET` is supported. 

``` 
text    .. what to write. Length shouldn't matter.
colors  .. Color of each letter, so an array of decimal converted hex-colors.
timeout .. If a text exceeds the length of printable chars, when to scroll. Also affects time _before_ something is written.
``` 

### Azure Service Bus

Configure appropriately in [config.toml](config.toml) and whatever message is received will be displayed in a single color and with a 2 second timeout.  (For now)

# License

Apache 2.0
