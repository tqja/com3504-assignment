/**
 * Generate a username composed of a random adjective, noun, and 4-digit number.
 * @returns {string}
 */
const generateUsername = () => {
  // source: https://www.thesaurus.com/e/grammar/list-of-adjectives
  const adjectives = [
    "Arrogant", "Beautiful", "Circular", "Competent", "Confusing", "Courageous", "Cumbersome", "Dainty", "Dark",
    "Efficient", "Expensive", "Fickle", "Generous", "Graceful", "Grumpy", "Helpful", "Hopeful", "Hot", "Hungry", "Mild",
    "Modern", "Muscular", "New", "Oval", "Petite", "Proud", "Rich", "Round", "Rude", "Safe", "Scary", "Sleepy", "Small",
    "Smart", "Smelly", "Stable", "Strange", "Thin", "Tardy", "Wicked", "Weary", "Wooden", "Youthful", "Zany"
  ];

  // source: https://7esl.com/list-of-nouns/#Regular_Plural_Nouns
  const nouns = [
    "Bag", "Belief", "Calf", "Car", "Chef", "Cherry", "Chief", "Country", "Cuff", "Dish", "Dog", "Domino", "Echo",
    "Family", "Half", "Halo", "Hero", "Hoof", "House", "Judge", "Knockoff", "Lady", "Leaf", "Life", "Loaf", "Mosquito",
    "Party", "Piano", "Photo", "Potato", "Radio", "Roof", "Scar", "Shelf", "Soprano", "Table", "Thief", "Tomato",
    "Video", "Volcano", "Wife", "Witch", "Wolf"
  ];

  // select a random adjective and noun from the arrays
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  // generate random 4 digit number
  const digits = Math.floor(Math.random() * 9000 + 1000);

  return adjective + noun + digits.toString();
}

module.exports = {generateUsername};
