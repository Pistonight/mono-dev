# Signing

[`minisign`](https://jedisct1.github.io/minisign/) is used to sign binary
releases (e.g. on GitHub Releases).

If a signature file (*.sig) is present in the release, you can
verify the signature with the following command:

```bash
minisign -Vm <file> -P RWThJQKJaXayoZBe0YV5LV4KFkQwcqQ6Fg9dJBz18JnpHGdf/cHUyKs+
```
