# placeholder

!!! warning
    the configuration is for advanced users only.

!!! danger
    using the wrong placeholder could cause the bot to fail, also its possible that you accidentally leak data that you dont want to leak (for example the bot token). **there are no fallbacks.**

```c
${key.key.key}
```
<small>this just prints directly from the cache, you can dump the cache with the [dump command](/mooncord/sites/Usage/Discord/dump/).</small>  
<br>
```c
$clear
```
<small>places a empty string.</small>  
<br>
```c
${current_timestamp}
```
<small>places the current timestamp.</small>    
<br>
```c
${icon:id}
```
<small>places a icon from the [config](/mooncord/sites/Configuration/Advanced/Embed/icon/).</small>  
<br>
```c
${percent:digits:value}
```
<small>convert a float/double to a percent value.</small>  
<br>
```c
${reduce:digits:factor:value}
```
<small>reduce a value by factor.</small>  
<br>
```c
${round:digits:value}
```
<small>round a value.</small>  
<br>
```c
${max:max:value}
```
<small>limit a value to max (for example max is 5 and value is 6, this function will limit to 5).</small>  
<br>
```c
${formatDate:value}
```
<small>format Date.</small>  
<br>
```c
${formatTime:value}
```
<small>format Time.</small>  
<br>
```c
${timestamp:value}
```
<small>convert value to timestamp.</small>  
<br>
```c
${isPresent:key:searchValue:validValue:invalidValue}
```
<small>set a value if a value is included in a object.</small>  
<br>
```c
${isMatching:key:value:validValue:invalidValue}
```
<small>set a value if a key is matching the value.</small>  
<br>