# floraExplorer
Welcome to the floraExplorer plant sightings web application. You can post your latest plant sightings with other plant connoisseurs to discuss with each other. You can also post a plant and get its name from our live chat in each photo. Please feel free to post all your plant findings, explore new plants, and share your sightings with others!
floraExplorer is a webapp implemented for the Univerity of Sheffield COM3504 assignment by group BSc15.
## Features
- Adding plant sightings for other users and yourself to view with its own features such as its name, description, area which it was sighted in, length, spread, if it has leaves, if it has flowers, if it is fragrant, if it is  native, what sunlight does it grow in, what soil it grows in, and what main color it is. Users must also post a photo of the plant.

- Users can interact with one another to allow them to discuss the plants, and in the scenario where a user needs help in identifying a plant other users may make suggestions in the livechat of the sighting.

- A find my location feature which can detect where the user currently is and submit the forms location for them

-  Sorting and filtering features where users can filter for different features and sort those features in terms of (earliest post, latest post, closest sighting to me, and furthest sighting from me). Users can also view all of their posts with the my posts filter.

- Each user is assigned a randomly generated username to be used throughout their experience within the app where they will find out their username once they have posted a sighting or when they commented on a post.

## Getting Started
Ensure you have Node.js and MongoDB installed on your local device and that MongoDB is running
```
mongod.exe
```
Extract the code repository and ensure you `npm install` the dependencies.

Start the node server through `.\bin\www`

```
node .\bin\www
```

Then visit http://localhost:3000/ to access the webapp

## Dependencies:
| Package Name            | Version        |
|-------------------------|----------------|
| `autoprefixer`          | `^10.4.19`     |
| `body-parser`           | `^1.20.2`      |
| `cookie-parser`         | `~1.4.4`       |
| `debug`                 | `~2.6.9`       |
| `ejs`                   | `^3.1.9`       |
| `express`               | `^4.18.3`      |
| `fetch-sparql-endpoint` | `^4.1.1`       |
| `http-errors`           | `~1.6.3`       |
| `mongoose`              | `^8.2.1`       |
| `morgan`                | `~1.9.1`       |
| `multer`                | `^1.4.5-lts.1` |
| `postcss`               | `^8.4.38`      |
| `postcss-cli`           | `^11.0.0`      |
| `socket.io`             | `^4.7.5`       |
| `tailwindcss`           | `^3.4.3`       |

## Features

### Home Page
The landing page of the webapp. This page will display a grid of posts, which will be unpopulated on first run, a
sidebar for sorting and filtering the posts, and a navbar for navigating to the creation form or back to the home page.
When the grid is populated with posts, users are able to navigate to the details of a post by clicking anywhere on the
grid square.

### Create Post
The button on the right on the navbar will navigate to the form for creating a new plant observation. Users may add a
photo of the observation from the filesystem or from a URL, accepting the following filetypes:

- jpg
- jpeg
- png
- gif
- bmp
- tif
- tiff

The URL upload option is unavailable when the app is offline.

When online, the location may be selected by clicking on the map. This location can also be selected automatically with
the **Find my location** button, using the location of the device via. geolocation API. When offline, this map is
replaced by input fields for the latitude and longitude which must be manually entered.

Finally, the attributes of the plant can be configured before submitting the observation. Submitting will redirect to
the home page where the post can now be viewed.

### Viewing an Observation
Clicking on a post will redirect to the details of the plant observation. All details about the post are viewable,
including the poster's username and the status of the observation (in progress/completed). If the user who accesses the
post is the user who created it, then there appear options to change the name of the observation and mark the 
observation as complete. Once marked as complete, the name cannot be modified and the live chat cannot be posted to.

### DBPedia

DBPedia queries are made when a user accesses the details of an observation. If the fetch is successful, the information
retrieved will be displayed in the page content. If the fetch is unsuccessful, there will instead be a placeholder
informing the user that no entry was found.

The query is based on the current name of the observation, and the query is retried if the user changes the name of the
observation. The query should work for most plants, if the name matches either the rdfs:label or dbo:binomial. However,
the query filters by several rdf:types in order to only return plant-related entries. Some entries in DBPedia have
unpredictable types, such as Cactus having a type of dbo:Person, which causes some actual plants to not be found by the
query. We decided it is more important for the query to filter by plants than to search for all types but be capable of 
returning non-plants. The list of types being filtered are as follows:

- dbo:Plant
- dbo:Eukaryote
- dbo:FloweringPlant
- dbo:Gnetophytes
- dbo:Conifer
- dbo:GreenAlga
- dbo:ClubMoss
- dbo:Moss
- dbo:Cycad
- dbo:Fern
- dbo:CultivatedVariety
- dbo:Ginkgo
- dbo:Person
- yago:Plant100017222

If the DBPedia query fails on an entry that should be a plant, it is likely that the type is not encompassed in this
list.