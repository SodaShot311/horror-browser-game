window.SCENES = {
  leavingWork: {
    id: "leavingWork",
    chapter: "Chapter 1",
    title: "Leaving Work",
    text: [
      "The service door clicks shut behind you. For a moment, the building hums like it is relieved to be rid of you.",
      "Your phone says 1:17 AM. Battery: fifteen percent. The taxi app spins, apologizes, and spins again.",
      "Fog presses against the loading bay lights. Home is only forty minutes away on foot."
    ],
    effects: { sound: "rain", background: "street" },
    choices: [
      { text: "Walk normally", next: "streetlights", fear: 0 },
      { text: "Call a friend", next: "friendCall", fear: -1, battery: -2 },
      { text: "Order a taxi", next: "taxiCancelled", battery: -1 }
    ]
  },
  friendCall: {
    id: "friendCall",
    chapter: "Chapter 1",
    title: "No Answer",
    text: [
      "The call rings seven times. On the eighth, someone answers but says nothing.",
      "You hear breathing. Then your own voice, far away, whispers, \"Do not turn around.\"",
      "The line dies. Your phone feels colder than the air."
    ],
    effects: { sound: "buzz", background: "street" },
    choices: [
      { text: "Put the phone away", next: "streetlights", fear: 2 },
      { text: "Call again", next: "friendCallAgain", fear: 2, battery: -3 }
    ]
  },
  friendCallAgain: {
    id: "friendCallAgain",
    chapter: "Chapter 1",
    title: "Busy Signal",
    text: [
      "This time the call connects instantly.",
      "A flat tone drills into your ear. Beneath it, something drags metal across wet pavement in time with your pulse."
    ],
    effects: { sound: "dragging", shake: true },
    choices: [
      { text: "Start walking", next: "streetlights", fear: 2 }
    ]
  },
  taxiCancelled: {
    id: "taxiCancelled",
    chapter: "Chapter 1",
    title: "Cancelled",
    text: [
      "Driver found. Driver nearby. Driver delayed.",
      "The app redraws the map three times, then empties itself. WEATHER ADVISORY: SERVICE UNAVAILABLE.",
      "A streetlight blinks across the lot. Once. Twice. Like an eye trying to stay open."
    ],
    effects: { sound: "buzz", background: "street" },
    choices: [
      { text: "Walk home", next: "streetlights", fear: 1 }
    ]
  },
  streetlights: {
    id: "streetlights",
    chapter: "Chapter 1",
    title: "Streetlights",
    text: [
      "The first block is familiar: shuttered bakery, pharmacy sign, the bus stop with the cracked plastic roof.",
      "Then the streetlights go out one by one behind you.",
      "From the alley comes a slow dragging sound. It stops when you stop."
    ],
    effects: { sound: "dragging", background: "fog" },
    randomWhisper: true,
    choices: [
      { text: "Investigate the alley", next: "alley", fear: 2, battery: -2, requiresBattery: true },
      { text: "Keep walking", next: "theFog", fear: 1 },
      { text: "Call someone", next: "deadLine", fear: 1, battery: -2 }
    ]
  },
  alley: {
    id: "alley",
    chapter: "Chapter 1",
    title: "Alley",
    text: [
      "Your flashlight finds trash bags, rainwater, a broken umbrella.",
      "Something pale slides behind the dumpster. When you step closer, you find only an old worker ID clipped to a lanyard.",
      "The photo has been scratched away, but your name is typed beneath it."
    ],
    effects: { sound: "heartbeat", background: "fog" },
    clue: "FoundWorkerID",
    item: "Worker ID",
    choices: [
      { text: "Take the ID", next: "theFog", fear: 2 },
      { text: "Leave it there", next: "theFog", fear: 1 }
    ]
  },
  deadLine: {
    id: "deadLine",
    chapter: "Chapter 1",
    title: "Dead Line",
    text: [
      "Every contact shows the same name: HOME.",
      "You do not remember saving it. You do not remember the number. You remember, suddenly, that you live alone.",
      "The phone rings in your apartment somewhere ahead."
    ],
    effects: { sound: "buzz" },
    choices: [
      { text: "Hang up", next: "theFog", fear: 2 },
      { text: "Listen", next: "theFog", fear: 3, battery: -1 }
    ]
  },
  theFog: {
    id: "theFog",
    chapter: "Chapter 2",
    title: "The Fog",
    text: [
      "The road forgets its own shape. Buildings flatten into silhouettes. The crosswalk paint looks freshly drawn, then old, then freshly drawn again.",
      "At an intersection, four ways wait. None of them point where they should."
    ],
    effects: { sound: "wind", background: "fog" },
    choices: [
      { text: "Take the shortcut", next: "convenienceStore", fear: 1 },
      { text: "Stay on the main road", next: "mainRoad", fear: -1 },
      { text: "Cut through the park", next: "park", fear: 2 },
      { text: "Wait for the fog to thin", next: "waiting", fear: 2 }
    ]
  },
  convenienceStore: {
    id: "convenienceStore",
    chapter: "Chapter 2",
    title: "Abandoned Convenience Store",
    text: [
      "The store doors open when you touch them, although the power is out.",
      "A bell rings once. Behind the counter, a newspaper is folded to an article about a night worker found dead after walking home in heavy fog.",
      "Beside it sits a tiny red charm and a leaking pack of batteries."
    ],
    effects: { sound: "buzz", background: "store" },
    clue: "ReadNewspaper",
    item: "Newspaper",
    choices: [
      { text: "Take the charm", next: "storeCharm", fear: -1, item: "Lucky Charm", clue: "FoundLuckyCharm" },
      { text: "Take the batteries", next: "storeBattery", battery: 10 },
      { text: "Read the back page", next: "storeGhost", fear: 2, clue: "SawGhost" }
    ]
  },
  storeCharm: {
    id: "storeCharm",
    chapter: "Chapter 2",
    title: "Red Thread",
    text: [
      "The charm is warm. A red thread coils around your finger as if it has been waiting for your hand.",
      "For three breaths, the dragging outside becomes footsteps. Human. Tired."
    ],
    effects: { sound: "rain" },
    item: "Lucky Charm",
    clue: "FoundLuckyCharm",
    choices: [
      { text: "Leave the store", next: "apartmentDistrict", fear: -1 }
    ]
  },
  storeBattery: {
    id: "storeBattery",
    chapter: "Chapter 2",
    title: "Borrowed Light",
    text: [
      "Only one battery has charge left. Your phone climbs a little above despair.",
      "In the dark freezer glass, a worker stands behind you wearing your jacket. When you blink, the aisle is empty."
    ],
    effects: { sound: "heartbeat" },
    choices: [
      { text: "Leave quickly", next: "apartmentDistrict", fear: 1 }
    ]
  },
  storeGhost: {
    id: "storeGhost",
    chapter: "Chapter 2",
    title: "Back Page",
    text: [
      "The article continues on the back: the worker's body was never recovered.",
      "A witness claimed the fog opened like a door. The quote is underlined in a hand that looks like yours."
    ],
    effects: { sound: "heartbeat" },
    clue: "SawGhost",
    choices: [
      { text: "Fold the paper closed", next: "apartmentDistrict", fear: 1 }
    ]
  },
  mainRoad: {
    id: "mainRoad",
    chapter: "Chapter 2",
    title: "Main Road",
    text: [
      "You follow the larger road by memory, counting storefronts. Seven should mean the laundromat. Seven means a brick wall.",
      "A bus passes without headlights. Every passenger turns to watch you."
    ],
    effects: { sound: "wind", background: "fog" },
    choices: [
      { text: "Keep to the curb", next: "apartmentDistrict", fear: 1 },
      { text: "Wave at the bus", next: "badEnding", fear: 2 }
    ]
  },
  park: {
    id: "park",
    chapter: "Chapter 2",
    title: "Park Path",
    text: [
      "The park gate is locked until you touch it. The chain drops into the grass without a sound.",
      "Between the trees, someone walks beside you on a path that is not there."
    ],
    effects: { sound: "footsteps", background: "fog" },
    choices: [
      { text: "Match their pace", next: "badEnding", fear: 3 },
      { text: "Run for the apartments", next: "apartmentDistrict", fear: 2, battery: -2 }
    ]
  },
  waiting: {
    id: "waiting",
    chapter: "Chapter 2",
    title: "Waiting",
    text: [
      "You wait under a dead traffic light. The fog does not move. Your watch does.",
      "When you look again, the minute hand is crawling backward."
    ],
    effects: { sound: "heartbeat" },
    choices: [
      { text: "Move before it gets worse", next: "apartmentDistrict", fear: 2 },
      { text: "Wait one more minute", next: "badEnding", fear: 3 }
    ]
  },
  apartmentDistrict: {
    id: "apartmentDistrict",
    chapter: "Chapter 2",
    title: "Apartment District",
    text: [
      "Your apartment blocks rise from the fog, too tall and too close together.",
      "Under a broken streetlight stands a figure in a soaked work uniform.",
      "You know, without knowing how, that it has walked this route longer than you have."
    ],
    effects: { sound: "buzz", background: "apartment" },
    choices: [
      { text: "Approach the figure", next: "figure", fear: 2 },
      { text: "Avoid it and enter the building", next: "lobby", fear: 1 },
      { text: "Use your flashlight on it", next: "figureLight", battery: -4, fear: 1, requiresBattery: true }
    ]
  },
  figure: {
    id: "figure",
    chapter: "Chapter 2",
    title: "Under the Light",
    text: [
      "The figure turns. Its face is fog, but the fog is trying to remember features.",
      "It lifts one hand and points at your building. The gesture is not a threat. It is a warning."
    ],
    effects: { sound: "heartbeat" },
    clue: "SawGhost",
    choices: [
      { text: "Thank it", next: "lobby", fear: -2 },
      { text: "Run inside", next: "lobby", fear: 2 }
    ]
  },
  figureLight: {
    id: "figureLight",
    chapter: "Chapter 2",
    title: "White Beam",
    text: [
      "The flashlight cuts through the fog. For one second the worker has your face, bruised and rain-bright.",
      "Then the beam dies. The streetlight is empty."
    ],
    effects: { sound: "buzz", shake: true },
    clue: "SawGhost",
    choices: [
      { text: "Enter the building", next: "lobby", fear: 2 }
    ]
  },
  lobby: {
    id: "lobby",
    chapter: "Chapter 3",
    title: "Lobby",
    text: [
      "The lobby smells of wet concrete and old flowers. The security desk lamp is on.",
      "The guard looks up from a logbook. \"You already came in,\" he says.",
      "Behind you, the glass doors show only fog."
    ],
    effects: { sound: "buzz", background: "apartment" },
    choices: [
      { text: "Use the stairs", next: "stairs", fear: 1 },
      { text: "Use the elevator", next: "elevator", fear: 1 },
      { text: "Talk to the guard", next: "guard", fear: -1 },
      { text: "Hide behind the mailboxes", next: "hide", fear: 2 }
    ]
  },
  guard: {
    id: "guard",
    chapter: "Chapter 3",
    title: "Security Guard",
    text: [
      "The guard turns the logbook around. Your name is written on every line for the past seven years.",
      "\"Some people make it upstairs,\" he says. \"Some remember why they were walking.\""
    ],
    effects: { sound: "heartbeat" },
    clue: "FoundWorkerID",
    choices: [
      { text: "Ask what happened", next: "guardTruth", fear: 1 },
      { text: "Go upstairs", next: "stairs", fear: 0 }
    ]
  },
  guardTruth: {
    id: "guardTruth",
    chapter: "Chapter 3",
    title: "The Logbook",
    text: [
      "\"A worker left late,\" the guard says. \"Too tired to notice the truck. Too tired to know the walk was over.\"",
      "He closes the book gently. \"The fog is what the mind does when it cannot go home.\""
    ],
    effects: { sound: "heartbeat" },
    clue: "ReadNewspaper",
    choices: [
      { text: "Take the stairs", next: "stairs", fear: -1 }
    ]
  },
  stairs: {
    id: "stairs",
    chapter: "Chapter 3",
    title: "Stairs",
    text: [
      "Each floor repeats the last. Same stain. Same missing bulb. Same wet footprint on the landing.",
      "Your door waits at the end of the hall, though your floor number is wrong."
    ],
    effects: { sound: "footsteps" },
    choices: [
      { text: "Unlock your door", next: "endingCheck", fear: 0 },
      { text: "Look through the peephole first", next: "peephole", fear: 2 }
    ]
  },
  elevator: {
    id: "elevator",
    chapter: "Chapter 3",
    title: "Elevator",
    text: [
      "The elevator opens before you press the button. The mirror inside is fogged from the wrong side.",
      "As it rises, the floor numbers become dates. Tonight's date appears twice."
    ],
    effects: { sound: "buzz", shake: true },
    choices: [
      { text: "Get out at your floor", next: "endingCheck", fear: 1 },
      { text: "Press the basement button", next: "badEnding", fear: 3 }
    ]
  },
  hide: {
    id: "hide",
    chapter: "Chapter 3",
    title: "Mailboxes",
    text: [
      "You crouch behind the mailboxes until your legs ache.",
      "Something enters the lobby. It does not breathe. It checks each box, one by one, reading names aloud in your voice."
    ],
    effects: { sound: "dragging" },
    choices: [
      { text: "Stay hidden", next: "badEnding", fear: 2 },
      { text: "Run for the stairs", next: "stairs", fear: 2 }
    ]
  },
  peephole: {
    id: "peephole",
    chapter: "Chapter 3",
    title: "Peephole",
    text: [
      "Through the peephole you see your own apartment from the inside.",
      "A shape stands in your living room, facing the door, waiting for you to become brave enough to enter."
    ],
    effects: { sound: "heartbeat" },
    choices: [
      { text: "Open the door anyway", next: "badEnding", fear: 2 },
      { text: "Whisper that you remember", next: "endingCheck", fear: -2 }
    ]
  },
  endingCheck: {
    id: "endingCheck",
    chapter: "Chapter 3",
    title: "The Door",
    text: [
      "The key turns. The hallway light flickers. Behind you, the dragging sound reaches the landing.",
      "For a second, the door opens onto your apartment. For another, onto the street where your walk began."
    ],
    effects: { sound: "heartbeat" },
    choices: [
      { text: "Step through", endingCheck: true }
    ]
  },
  goodEnding: {
    id: "goodEnding",
    chapter: "Ending",
    title: "Good Ending: The Road Ends",
    ending: "Good Ending",
    cinematicText: [
      "The fog finally lifted.",
      "Morning light returned.",
      "The road remembered where it was supposed to end.",
      "Some things were never explained.",
      "Some doors should never have been opened.",
      "But you survived."
    ],
    credits: [
      "THE LONG WALK HOME",
      "Created by 陳奇埏",
      "Programming 陳奇埏, CLaude and Codex",
      "Story 陳奇埏, ChatGpt and Gemini",
      "Art and Sound 陳奇埏 and Gemini",
      "Special thanks to 郭振輝, 高淑芝 and 鄒月雲 for presentating the project.",
      "Thank you for playing."
    ],
    text: [
      "The worker ID, the newspaper, the charm, and the face beneath the streetlight settle into one clean memory.",
      "You remember the truck. You remember the rain. You remember standing up afterward because home was close and you were so tired.",
      "The figure takes your hand. Together, you step out of the fog. For the first time in years, the road ends."
    ],
    effects: { sound: "wind" },
    choices: [
      { text: "Walk again", next: "leavingWork", restart: true },
      { text: "Return to title", menu: true }
    ]
  },
  badEnding: {
    id: "badEnding",
    chapter: "Ending",
    title: "Bad Ending: The Long Walk",
    ending: "Bad Ending",
    cinematicText: [
      "The fog did not lift.",
      "The street folded back on itself.",
      "Some things were never explained.",
      "Some doors should never have been opened.",
      "Your apartment stayed one block away.",
      "The long walk began again."
    ],
    credits: [
      "THE LONG WALK HOME",
      "Created by SodaShot",
      "Programming",
      "Story",
      "Art and Sound",
      "Thank you for playing."
    ],
    text: [
      "You reach your apartment, or the park, or the same intersection again. It no longer matters which.",
      "The fog opens behind you. Something wearing a work uniform reaches out with your hands.",
      "By morning, the street is empty except for a phone blinking at zero percent. Your apartment is still one block away."
    ],
    effects: { sound: "dragging", shake: true },
    choices: [
      { text: "Try another walk", next: "leavingWork", restart: true },
      { text: "Return to title", menu: true }
    ]
  }
};
