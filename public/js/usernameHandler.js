import { getUsernameFromIDB, storeUsernameInIDB } from "./idbHelper.js";

/**
 * Attempt to retrieve an existing username from indexedDB and verify with server. If not present,
 * generate a new username and save in server + indexedDB.
 * @returns {Promise<void>}
 */
const handleUsername = async () => {
  const username = await getUsernameFromIDB();
  if (username) {
    // check if the username exists on the server
    await verifyUsername(username);
  } else {
    // request a new username and save to indexedDB
    await getNewUsername();
  }
};

/**
 * Check if the username is present or not in the serverside database.
 * Verification on the serverside ensures that only generated nicknames are considered valid.
 * @param username The username to verify
 * @returns {Promise<void>}
 */
const verifyUsername = async (username) => {
  // verify that the stored username matches an entry on the server
  const res = await fetch("/verify-username", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();

  if (!data.valid) {
    // if username not on server, request a new username
    await getNewUsername();
  }
};

/**
 * Get a new username from the server and save to indexedDB
 * @returns {Promise<void>}
 */
const getNewUsername = async () => {
  const res = await fetch("/new-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (res.ok) {
    // store the newly generated username in indexedDB
    const { username } = data;
    await storeUsernameInIDB(username);
  } else {
    console.error(data.error);
  }
};

// call handler on page load
window.addEventListener("load", handleUsername);
