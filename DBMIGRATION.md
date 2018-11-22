# Migration step
## Create a new instance of Postgresql docker with the latest version
$ `docker run -d \`
  <br />`--name` **\<DockerName\>** `\`
  <br />`-e POSTGRES_DB=prisma \`
  <br />`-e POSTGRES_USER=prisma \`
  <br />`-e POSTGRES_PASSWORD=prisma \`
  <br />`-v /var/lib/postgresql/update:/var/lib/postgresql/data:rw \`
  <br />`postgres:latest`

## Create a new user `prisma` for the container
$ `docker exec --privileged` **\<Temp_Postgres_DockerName\>** `reateuser prisma -U prisma`

## Move your current database to the latest version database
$ `docker exec \`
<br />`profileservice_postgres_1 pg_dump prisma -U prisma | \`
<br />`docker exec --privileged` **\<DockerName\>** `psql -U prisma`

## Find local file for the previous database
$ `docker volume ls`
<br />$ `docker volume inspect` **\<Temp_Postgres_DockerName\>** `(postgres)`

## Stop old container
$ `docker stop` **\<Current_Postgres_DockerName\>**

## Remove currrent docker MountPoint files
$ `sudo -i`
<br />\# `rm -r` **\<Volume_MountPoint\>**

## Replace current docker MountPoint file 
<br />\# `docker cp` **\<Temp_Postgres_DockerName\>** `:/var/lib/postgresql/data` **\<Volume_MountPoint\>**
<br />\# `exit`

## Stop and remove new container
$ `docker stop` **\<Temp_Postgres_DockerName\>**
<br />$ `docker rm` **\<Temp_Postgres_DockerName\>**

## Restart docker-compose
$ `docker-compose -f docker-compose-dev.yml rm`
<br />$ `docker-compose -f docker-compose-dev.yml up --build`