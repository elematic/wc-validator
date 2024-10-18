# @elematic/wc-validator-server

Web Component Package Validator

## Building and deploying

### Docker build

### Run Docker container locally

From the top level of the monorepo:

```sh
docker build -f packages/wc-validator-server/Dockerfile -t wc-validator .
```

```sh
docker run --rm --name wc-validator -p 3700:8080 wc-validator
```
