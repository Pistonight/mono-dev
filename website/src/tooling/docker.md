# Docker

Containerization steps can be either its own package or the same package
as the server for simple containers.

The `Dockerfile` should be in the root of that package, may be something like:
```dockerfile
FROM alpine:latest
EXPOSE 80
ENV APP_DIR=/app
COPY ./dist $APP_DIR
RUN chmod +x $APP_DIR/bin/changeme

WORKDIR $APP_DIR

ENV FOO=BAR                    \
    BIZ=BAZ                    

ENTRYPOINT ["/app/bin/changeme"]
```

Usually, docker workflow downloads artifact from CI, then build container locally.

It's recommended to setup a `pull` which downloads from CI, and a `pull-local` to
copy local artifacts

```yaml
tasks:
  pull:
    desc: Pull build artifacts from CI using current commit
    cmds:
      - magnesis
  pull-local:
    desc: Copy build artifacts from local build output
    cmds:
      - cp ...
```

The actual container operations:
```yaml
includes:
  docker:
    taskfile: ../mono-dev/task/docker.yaml
    internal: true

vars:
  DOCKER_IMAGE: pistonite/foo

tasks:

  build:
    cmds:
      - task: docker:build

  run:
    cmds:
      - task: docker:run
        vars: 
          DOCKER_RUN_FLAGS: >
            -p 8000:80
            -e FOO=BAR
            -e GIZ=BAZ
  
  connect:
    cmds:
      - task: docker:connect

  stop:
    cmds:
      - task: docker:stop
  
  clean:
    cmds:
      - task: docker:clean
```
