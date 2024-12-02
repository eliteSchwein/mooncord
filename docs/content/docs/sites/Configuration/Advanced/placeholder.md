# placeholder

!!! warning
    the configuration is for advanced users only.

!!! danger
    using the wrong placeholder could cause the bot to fail, also its possible that you accidentally leak data that you dont want to leak (for example the bot token). **there are no fallbacks.**

`${key.key.key}`  
<small>this just prints directly from the cache, you can dump the cache with the [dump command](/mooncord/sites/Usage/Discord/dump/).</small>  

`$clear`  
<small>places a empty string.</small>  

`${current_timestamp}`  
<small>places the current timestamp.</small>  

`${icon:id}`  
<small>places a icon from the [config](/mooncord/sites/Configuration/Advanced/Embed/icon/).</small>

`${percent:digits:value}`  
<small>convert a float/double to a percent value.</small>  

`${reduce:digits:factor:value}`  
<small>reduce a value by factor.</small>  

`${round:digits:value}`  
<small>round a value.</small>  

`${max:max:value}`  
<small>limit a value to max (for example max is 5 and value is 6, this function will limit to 5).</small>  

`${formatDate:value}`  
<small>format Date.</small>  

`${formatTime:value}`  
<small>format Time.</small>  

`${timestamp:value}`  
<small>convert value to timestamp.</small>