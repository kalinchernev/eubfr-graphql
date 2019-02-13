## Build the container

```sh
$ docker build -t ecs-graphql .
```

## See images

```sh
$ docker images
```

## Remove images

```sh
$ docker rmi <image-id>
```

## Run container

```sh
$ docker run -p 80:3000 ecs-graphql
```

## Kill container

See running processes:

```
$ docker ps
```

Kill a given container process

```sh
$ docker kill <container-id>
```
