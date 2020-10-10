# jamesfriend.com.au

## instructions
### dev server

the first time after checkout, create https cert/key:
https://letsencrypt.org/docs/certificates-for-localhost/

add it to the system keychain & trust it:
https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/

then

```
node development-server.js
```

### build for prod and publish to s3

```
node build && node upload
```