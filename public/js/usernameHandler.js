/**
 * Attempt to retrieve an existing username from indexedDB. If not present,
 * generate a new username and save in indexedDB.
 * @returns {string}
 */

const generateUsername = () => {
  // source: https://www.thesaurus.com/e/grammar/list-of-adjectives
  const adjectives = [
    "Arrogant",
    "Beautiful",
    "Circular",
    "Competent",
    "Confusing",
    "Courageous",
    "Cumbersome",
    "Dainty",
    "Dark",
    "Efficient",
    "Expensive",
    "Fickle",
    "Generous",
    "Graceful",
    "Grumpy",
    "Helpful",
    "Hopeful",
    "Hot",
    "Hungry",
    "Mild",
    "Modern",
    "Muscular",
    "New",
    "Oval",
    "Petite",
    "Proud",
    "Rich",
    "Round",
    "Rude",
    "Safe",
    "Scary",
    "Sleepy",
    "Small",
    "Smart",
    "Smelly",
    "Stable",
    "Strange",
    "Thin",
    "Tardy",
    "Wicked",
    "Weary",
    "Wooden",
    "Youthful",
    "Zany",
  ];

  // source: https://7esl.com/list-of-nouns/#Regular_Plural_Nouns
  const nouns = [
    "Bag",
    "Belief",
    "Calf",
    "Car",
    "Chef",
    "Cherry",
    "Chief",
    "Country",
    "Cuff",
    "Dish",
    "Dog",
    "Domino",
    "Echo",
    "Family",
    "Half",
    "Halo",
    "Hero",
    "Hoof",
    "House",
    "Judge",
    "Knockoff",
    "Lady",
    "Leaf",
    "Life",
    "Loaf",
    "Mosquito",
    "Party",
    "Piano",
    "Photo",
    "Potato",
    "Radio",
    "Roof",
    "Scar",
    "Shelf",
    "Soprano",
    "Table",
    "Thief",
    "Tomato",
    "Video",
    "Volcano",
    "Wife",
    "Witch",
    "Wolf",
  ];

  // select a random adjective and noun from the arrays
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  // generate random 4 digit number
  const digits = Math.floor(Math.random() * 9000 + 1000);

  return adjective + noun + digits.toString();
};

const handleUsername = async () => {
  let username = await getUsernameFromIDB();
  if (!username) {
    // request a new username and save to indexedDB
    username = await getNewUsername();
  }

  // if on a form, fill the hidden nickname field
  const nicknameInput = document.getElementById("nickname");
  if (nicknameInput) {
    nicknameInput.value = username;
  }
};

/**
 * Get a new username from the server and save to indexedDB.
 * @returns {Promise<*|null>} The generated username on success, or null on failure
 */
const getNewUsername = async () => {
  const username = generateUsername();
  await storeUsernameInIDB(username);
  return username;
};

// call handler on page load
window.addEventListener("load", handleUsername);
