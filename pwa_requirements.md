# Plant Recognition PWA

## Features

- Add new plant sightings
- View plants added by self/other users
- Comment on the plant sightings
- No login system required


## Adding new plant sightings

- Details of a sighting cannot be modified after creation (except identification)
- If online, send details to database ✅
	- ~~Images transformed to base64~~ Images stored locally on server
	- ~~Stored in MongoDB~~
	- Images can be uploaded from local files or from a URL
- If offline, store changes locally (to upload once online)
	- Should be able to hold several new plants locally
	- Must be able to add chat messages to both newly and previously added plants

### Data contained in a sighting:
- Date and time seen ✅
- Location (geolocation or optionally selecting from map) ✅
- Description (short) ✅
- Plant height and spread ✅
- Photograph of plant ✅
- Nickname of original user ✅
- Characteristics
    - Has flowers? (yes/no) ✅
    - Has leaves? (yes/no)
    - Has fruits or seeds? (yes/no) ✅
    - Level of sun exposure (full sun/partial shade/full shade) ✅
    - Colour of flowers
- Identification (**can be modified after creation**)
    - Name of plant
        - Can be set by original user
        - Original user can enable suggestions from other users
        - Original user can approve a suggested name
    - Status of identification (completed/in-progress)
    - Information from DBPedia knowledge graph ✅
        - Common and scientific name ✅
        - English language description ✅
        - URI linking to DBPedia page ✅


## Viewing plant sightings

- Accessible to all users (no need for login or privacy rules) ✅
- Sortable by
	- Date/time sighted (newest/oldest)
	- Has/has not been identified
	- Distance away (from user?)
- Filterable by plant characteristics
- Selecting a plant shows the full details and live chat ✅


## Live chat

- Progressive
- Support online/offline interaction
- Using socket.io
- Non-blocking
- Multimodal (access via multiple devices)
- New messages must appear in real time
- User can add new messages which appear in real time for other users
- Users should be notified of new messages on sightings they added
- Able to add chat messages to newly and previously added plants when offline
	- Offline chats will sync with server when online
- Chats are per-plant, so can store chat data within the plant object in MongoDB


## Online/offline interactions

### Transition from offline -> online
- Immediately upload local changes to the server
- Retrieve updates from server since last sync
	- New plants
	- Changes to identifications of existing plants
- Reload chat messages related to user's added plants
- Notify user of new chat messages on plants that they added


## Data storage/retrieval

### Storage
- MongoDB for network DB ✅
- indexedDB for browser storage (do not use cookies/local storage) ✅

### Information linked from DBPedia
- Use fetch-sparql-endpoint module ✅
- Retrieve annotations from DBPedia SPARQL endpoint ✅
- Fetch data in real time from DBPedia, do not store it ✅


## Mark scheme

### 40% - Web app and chat application
- Working offline and online
- Implementing a web worker
- Implementing an indexedDB

### 15% - Server
- Correct organisation of server and routes
- Non-blocking organisation (promises and callbacks/multiple servers/etc.)

### 15% - Server data storage
- Correct use of MongoDB including organisation into models, controllers, etc.

### 15% - Asynchronous and bidirectional client/server communication
- Correct use of HTTP requests and socket.io

### 15% - Connection to the knowledge graph
- Correct use of SPARQL query to fetch the information from DBPedia endpoint
- Correctly parsing JSON response form DBPedia and displaying it on the UI

### Code assessment:
- Functionality: Does code meet requirements?
- Documentation: In-line comments for unclear code/higher level documentation
- Git history and source
- Code execution: Should execute on normal machine without issue
- Code quality:
	- Consistent formatting (class/var naming, indentation)
	- Proper use of exception handling
	- Appropriate naming and documentation
	- Good organisation of code (readability, Node.js modules, etc.)
- We are expected to organise code as shown in labs


## Submission

- Self-contained directory named after the group, compressed in .zip format
- Submission should include:
	- All code in the `<MainDirectory>/solution` directory
	- README.md in `<MainDirectory>` to clarify installation/run instructions
	- Code documentation
	- Screenshots/video to show expected result in `<MainDirectory>/Screenshots`
- All code must be HTML5/JavaScript/CSS/Node.js
- Do not include the node modules folder in the submission
