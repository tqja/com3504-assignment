/**
 * Attempt to retrieve an existing username from indexedDB. If not present,
 * generate a new username and save in indexedDB.
 * @returns {Promise<void>}
 */
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
    return username;
  } else {
    console.error(data.error);
    return null;
  }
};

// call handler on page load
window.addEventListener("load", handleUsername);
