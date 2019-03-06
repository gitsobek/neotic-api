# neotic:API

The scope of this project includes the creation of an application that works in real time. The system is designed to listen to events occurring in a given part of the program, as a result, the user will see the result of the operations immediately after they have been executed. The foundation of this project is a database in which data about users, music and songs in binary and standard format will be collected. They will be stored in a non-relational database, which allows flexible use of information for appropriate purposes. The system is able to create personalized playlists and search for music data based on the form in graphic style. In addition, there is a division of users into administrators, producers, artists and ordinary listeners. The number of likes is counted and songs that are more popular than other songs are shown. Most importantly, the project also includes authorization, authentication, streaming and processing of files.

## Features

- Subscribing to service and sending mails to subscribers
- Login and registration
- Warning and banning users
- Creating playlists nad liked lists
- Searching for music
- Adding music

## Streaming mechanism

The whole concept is having huge amount of data (encoded music to binary) to process, without the need to wait for all the data to be available before starting to process it. The data is broken down and sent in chunks, the data that is waiting for being consumed is stored in a buffer.

## Searching for music

Algorithm:

1. Get song collections from database
2. Filter by song duration chosen by user
3. Filter by song genre chosen by user
4. Filter by song mood chosen by user
5. Sort filtered records descending by amount of likes
6. Send to user

Mood algoritm takes tempo and intensity of a song and calculates music mood clasification (0-10):

- 0-4.5 - relaxing music
- 4.5-7.5 - calm music
- 7.5-10 - energetic music

## Adding music

Adding your music consists of four stages. The first stage is adding information about the song to the database (title, artist name etc.). After the successive addition of the song, the algorithm goes to the second stage, which is to add a reference to the array of shared songs of the user who uploaded the given song. The third stage is adding a cover photo handled by a library called multer. The final stage is adding the song to the server and performing an analysis to determine certain parameters (duration, tempo and intensity of song). Adding a song is a mechanism that uses key-value ideas. The key is the ID of the added song, and the value is the binary data of the audio file.

## Plans for future

- Improve algorithm's performance

## Build Setup

Project can be run for development in two different ways.

- [Normal](#nodejs) (local NodeJS server)
- [Docker](#docker) (via `docker-compose`)

### NodeJS

```bash
# install dependencies
$ npm install

# run project
$ npm start
```

### Docker

At first, make sure you have installed latest stable version of `docker` and `docker-compose` packages in your system.

Most of the times that's the only commands you'll need:

- Running project
  ```bash
  $ docker-compose up
  $ docker-compose up -d # run in background
  ```
- Stopping project

  ```bash
  $ docker-compose stop
  ```

  If you're changing build configuration (`Dockerfile` or `build.*` options in `docker-compose.yml`), you'll have to force rebuild the project

  ```bash
  $ docker-compose up --build
  ```
