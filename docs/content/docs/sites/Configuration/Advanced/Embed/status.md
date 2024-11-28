# [status NAME]

!!! warning
    the configuration is for advanced users only.

`embed_id: EMBED`  
<small>Embed for status.</small>

`allow_same: false`  
<small>allow that the same status can get again triggered.</small>

```console
prevent: 
- OTHER_STATUS
```
<small>prevent other status states.</small>

`activity_status: dnd`  
<small>bot status (the small circle icon on the profile).</small>

`activity_type: CUSTOM`  
<small>bot status type.</small>

<br><br>
```console
[status shutdown]
embed_id: shutdown
allow_same: false
prevent:
- pause
activity_status: dnd
activity_type: CUSTOM
```
<small>shutdown configuration merged with locale as reference.</small>