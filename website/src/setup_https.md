# HTTPS

Some Web features requires a secure context. For example, copying stuff into clipboard.
Usually, for developer experience, the `localhost` host is considered secure.
If you only use `localhost` when developing (i.e. you are running the dev server
and visiting the page on the same machine), then you don't need HTTPS.

If you are like me, who uses a VM for development and hosts the dev server
in local network, then your host computer needs to be configured
to trust the web app hosted by the VM's dev server.

The steps for Windows are currently documented [here](https://vmsetup.pistonite.dev/tool/https).
I might move them to this page instead in the future.

The `mono-dev` Standard will look for `.cert/cert.key` and `.cert/cert.pem` 2 levels up.
So the recommendation is to put the `.cert` folder in the repo root.
