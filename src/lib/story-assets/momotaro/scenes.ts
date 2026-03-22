import type { MomotaroSceneDef } from "./types";
import { STYLE_BLOCK } from "./types";

const styleSuffix = `\n\n${STYLE_BLOCK}`;

export const MOMOTARO_SCENES: MomotaroSceneDef[] = [
  {
    page: 1,
    id: "river-introduction",
    title: "River Introduction",
    filename: "1-river-introduction.jpeg",
    phase: "child",
    hasProtagonist: false,
    referenceIds: ["old_woman", "village"],
    templatePrompt: `Wide establishing shot.

Camera slightly elevated at eye level looking across a peaceful river.

Composition: the river flows diagonally across the frame from lower left to upper right.
An elderly woman kneels at the riverbank on the right side of the frame washing clothes in a wooden tub.

Old Woman:
kneeling beside the water
hands working in the tub
expression calm and focused.

Environment:
smooth stones and grass in the foreground
clear river water reflecting light
background shows rice fields, small wooden houses, and distant mountains.${styleSuffix}`,
  },
  {
    page: 2,
    id: "peach-appears",
    title: "Peach Appears",
    filename: "2-peach-appears.jpeg",
    phase: "child",
    hasProtagonist: false,
    referenceIds: ["old_woman", "village"],
    templatePrompt: `Medium-wide shot.

Camera low eye-level positioned close to the water surface.

Composition: a giant peach floats in the river at center-left drifting toward the riverbank.

Old Woman:
kneeling on the right side of the frame beside a washing tub
leaning forward slightly toward the peach
expression surprised curiosity.

Environment:
river stones visible beneath the water
willow branches hanging above
background shows rice fields and distant mountains.${styleSuffix}`,
  },
  {
    page: 3,
    id: "carry-peach",
    title: "Carrying the Peach",
    filename: "3-carry-peach.jpeg",
    phase: "child",
    hasProtagonist: false,
    referenceIds: ["old_woman", "village"],
    templatePrompt: `Medium shot.

Camera eye-level.

Composition: the elderly woman stands beside the river at the center of the frame lifting a giant peach and placing it into a washing tub.

Old Woman:
bending slightly while lifting the peach with both arms
expression pleased but slightly strained from the weight.

Environment:
riverbank grass and stones in foreground
river behind her
bamboo and countryside houses in background.${styleSuffix}`,
  },
  {
    page: 4,
    id: "examine-peach",
    title: "The Couple Examine the Peach",
    filename: "4-examine-peach.jpeg",
    phase: "child",
    hasProtagonist: false,
    referenceIds: ["old_woman", "old_man", "house_interior"],
    templatePrompt: `Medium interior shot.

Camera eye-level across a low wooden table.

Composition: a giant peach rests at the center of the table.
An elderly man sits on the left side of the table and the elderly woman sits on the right.

Old Man:
leaning forward examining the peach
expression curious and puzzled.

Old Woman:
leaning forward with hands on table
expression intrigued.

Environment:
tatami mats on the floor
paper sliding doors behind them
warm lantern light illuminating the room.${styleSuffix}`,
  },
  {
    page: 5,
    id: "peach-opens",
    title: "Peach Opens",
    filename: "5-peach-opens-b.jpeg",
    phase: "baby",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "house_interior"],
    templatePrompt: `Close-up dramatic shot.

Camera slightly low angle looking toward the table.

Composition: the giant peach sits in the center of the frame splitting open with golden light glowing from inside.

Old Man:
leaning backward slightly
hands raised in surprise
expression astonished.

Old Woman:
leaning forward slightly
hands near chest
expression amazed.

Inside the peach sits the child protagonist.

Child:
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Environment:
low wooden table${styleSuffix}`,
    fillOutOverride: {
      expression: "calm wonder, newly revealed, gentle neutral curiosity",
    },
  },
  {
    page: 6,
    id: "couple-hold-child",
    title: "The Couple Hold the Child",
    filename: "6-couple-hold-child.jpeg",
    phase: "baby",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "house_interior"],
    templatePrompt: `Medium interior shot.

Camera eye-level.

Composition: the elderly couple sit close together at the center of the frame holding the child.

Old Woman:
holding the child gently
expression joyful and affectionate.

Old Man:
leaning toward the child
expression warm happiness.

Child:
held in the woman's arms
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Environment:
giant peach halves resting on the floor beside them
tatami mats and lantern light filling the room.${styleSuffix}`,
    fillOutOverride: { expression: "peaceful, soft happy baby-like calm" },
  },
  {
    page: 7,
    id: "getting-strong",
    title: "Getting Strong",
    filename: "7-getting-strong.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "village"],
    templatePrompt: `Medium-wide outdoor shot.

Camera eye-level.

Composition: the child stands in the center of a village yard lifting a bundle of firewood above their head while the elderly couple watch nearby.

Child:
standing confidently while lifting a bundle of wood
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Old Man:
standing slightly behind the child
arms crossed
expression impressed and proud.

Old Woman:
standing beside the old man
hands clasped
expression joyful and amazed.

Environment:
small countryside yard
wood pile and farming tools nearby
village houses and fields visible in the background.${styleSuffix}`,
    fillOutOverride: { expression: "determined, proud, energetic" },
  },
  {
    page: 8,
    id: "learning-about-ogres",
    title: "Learning About the Ogres",
    filename: "8-learning-about-ogres.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "house_interior", "oni"],
    templatePrompt: `Medium interior storytelling shot.

Camera eye-level across a low wooden table.

Composition: the elderly couple sit beside a low wooden table explaining something serious while the child listens in the center of the room.
Above the table floats a soft cloud-shaped storytelling bubble showing the ogres on their island.

Child:
standing beside the table
leaning slightly forward while listening carefully
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Old Man:
seated beside the table
one hand raised while explaining the ogres
expression serious and concerned.

Old Woman:
sitting beside him
hands folded on the table
expression worried.

Story bubble:
a soft cloud-shaped illustration hovering above the old man
inside the bubble three ogres (red, blue, green) stand on a rocky island fortress
ogres holding clubs and guarding treasure chests with gold
small stylized waves and a fortress on the island.

Environment:
tatami floor mats
low wooden table
paper sliding doors behind them
warm lantern light illuminating the room.${styleSuffix}`,
    fillOutOverride: {
      expression: "attentive, serious curiosity, focused listening",
    },
  },
  {
    page: 9,
    id: "declaring-quest",
    title: "Declaring Quest",
    filename: "9-declaring-quest .jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "house_interior"],
    templatePrompt: `Medium interior shot.

Camera eye-level.

Composition: the child stands in the center of the room speaking determinedly to the elderly couple who sit beside a low wooden table.

Child:
standing upright with confident posture
one hand slightly raised while speaking
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Old Man:
sitting beside the table
leaning forward slightly
expression surprised but proud.

Old Woman:
sitting beside the table
hands near her chest
expression worried but supportive.

Environment:
tatami floor mats
low wooden table
paper sliding doors
warm lantern light illuminating the room.${styleSuffix}`,
    fillOutOverride: { expression: "determined, brave, resolved" },
  },
  {
    page: 10,
    id: "preparing-dumplings",
    title: "Dumplings for the Journey",
    filename: "10-preparing-dumplings.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "house_interior", "bag"],
    templatePrompt: `Medium interior shot.

Camera eye-level.

Composition: a low wooden table in the center of the room where dumplings are being prepared.

Old Woman:
placing small dumplings into a bag
expression focused but caring.

Child:
standing beside the table watching
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Environment:
tatami floor
simple cooking tools
soft lantern lighting.${styleSuffix}`,
    fillOutOverride: { expression: "attentive, grateful, calm anticipation" },
  },
  {
    page: 11,
    id: "leaving-home",
    title: "Leaving Home",
    filename: "11-leaving-home.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "village", "bag"],
    templatePrompt: `Medium-wide shot.

Camera eye-level.

Composition: a countryside house sits in the background.
The child stands in the center foreground wearing a small travel bag.

Child:
standing confidently
body facing forward
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Old Woman:
standing in the doorway
hands clasped
expression proud but emotional.

Old Man:
standing beside her
arms relaxed
expression proud.

Environment:
grass and stone path leading from the house
fields and hills behind the village.${styleSuffix}`,
    fillOutOverride: {
      expression:
        "confident, brave, slightly tender/emotional, face to camera, walking away from house",
    },
  },
  {
    page: 12,
    id: "meeting-the-dog",
    title: "Meeting the Dog",
    filename: "12-meeting-the-dog.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "bag", "forest"],
    templatePrompt: `Medium shot.

Camera eye-level on a forest path.

Composition: the traveler stands on the left side of the frame while a dog sits on the right facing them.

Child:
standing slightly leaning forward
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
sitting alert
ears raised
expression curious and friendly.

Environment:
bamboo and pine trees surrounding the path
soft sunlight filtering through leaves.${styleSuffix}`,
    fillOutOverride: { expression: "curious, open, friendly" },
  },
  {
    page: 13,
    id: "sharing-the-dumpling",
    title: "Sharing the Dumpling",
    filename: "13-sharing-the-dumpling.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "bag", "forest"],
    templatePrompt: `Medium shot.

Camera eye-level.

Composition: traveler and dog positioned near the center of the frame.

Child:
kneeling slightly while offering a dumpling
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
sitting politely
looking at the dumpling.

Environment:
forest path with bamboo and pine trees
sunlight filtering through foliage.${styleSuffix}`,
    fillOutOverride: { expression: "kind, gentle, inviting" },
  },
  {
    page: 14,
    id: "monkey-joins",
    title: "Monkey Joins",
    filename: "14-monkey-joins.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "forest", "bag"],
    templatePrompt: `Medium-wide shot.

Camera low angle looking upward into the trees.

Composition: a monkey hangs from a branch above the traveler and dog.

Child:
standing below looking upward
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
standing beside the child looking upward.

Monkey:
hanging from a branch
expression playful and curious.

Environment:
bamboo forest canopy overhead
forest path below.${styleSuffix}`,
    fillOutOverride: { expression: "surprised curiosity, alert interest" },
  },
  {
    page: 15,
    id: "monkey-get-dumpling",
    title: "Sharing a Dumpling with the Monkey",
    filename: "15-monkey-get-dumpling.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "forest", "bag"],
    templatePrompt: `Medium shot.

Camera eye-level.

Composition: the traveler kneels near the center of the forest path offering a dumpling to a monkey standing nearby.

Child:
kneeling slightly while holding a dumpling forward
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
standing beside the traveler watching curiously.

Monkey:
standing upright reaching toward the dumpling
expression eager and curious.

Environment:
forest path surrounded by bamboo and pine trees
soft light filtering through leaves.${styleSuffix}`,
    fillOutOverride: { expression: "patient, friendly, reassuring" },
  },
  {
    page: 16,
    id: "pheasant-joins",
    title: "Pheasant Joins",
    filename: "16-phaesant-joins.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "forest", "bag"],
    templatePrompt: `Medium-wide shot.

Camera eye-level.

Composition: traveler and companions stand in the center of a forest clearing as a pheasant lands nearby.

Child:
standing upright
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
standing beside traveler.

Monkey:
standing on a rock or branch.

Pheasant:
landing with wings slightly spread.

Environment:
forest clearing with bamboo and pine trees.${styleSuffix}`,
    fillOutOverride: { expression: "calm confidence, welcoming curiosity" },
  },
  {
    page: 17,
    id: "pheasant-gets-dumpling",
    title: "Sharing a Dumpling with the Pheasant",
    filename: "17-phaesant-gets-dumpling.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "forest", "bag"],
    templatePrompt: `Medium-wide shot.

Camera eye-level.

Composition: the traveler stands in a small forest clearing offering a dumpling while a pheasant stands nearby with wings slightly spread.

Child:
standing upright offering a dumpling
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
sitting beside the traveler.

Monkey:
standing nearby watching the interaction.

Pheasant:
standing on the ground with wings slightly open
expression alert and curious.

Environment:
forest clearing surrounded by bamboo and pine
sunlight filtering through the trees.${styleSuffix}`,
    fillOutOverride: { expression: "gentle, focused, friendly" },
  },
  {
    page: 18,
    id: "looking-at-island",
    title: "Looking at the Island",
    filename: "18-looking-at-island-b.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "island", "bag"],
    templatePrompt: `Wide coastal shot.

Camera slightly elevated looking toward the sea.

Composition: the traveler and companions stand on a rocky shore in the foreground while the distant ogre island rises on the horizon.

Child:
standing at the center looking toward the island
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
standing alert beside the traveler.

Monkey:
standing on a rock shading their eyes while looking toward the island.

Pheasant:
perched on a rock with wings folded.

Environment:
rocky shoreline with waves
wide ocean view
dark rocky island with fortress visible in the distance.${styleSuffix}`,
    fillOutOverride: {
      expression:
        "serious, determined, slightly awed, looking away from camera",
    },
  },
  {
    page: 19,
    id: "boat-journey",
    title: "Boat Journey",
    filename: "19-boat-journey.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "island", "bag"],
    templatePrompt: `Wide shot.

Camera slightly elevated looking toward a small wooden boat on the sea.

Composition: the boat sits in the center of the frame traveling toward a distant rocky island.

Child:
sitting at the front of the boat
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
sitting beside the traveler.

Monkey:
crouched near the middle of the boat.

Pheasant:
perched on the edge of the boat.

Environment:
gentle ocean waves
rocky island with fortress in the distance.${styleSuffix}`,
    fillOutOverride: { expression: "focused, brave, calm before action" },
  },
  {
    page: 20,
    id: "ogre-fortress",
    title: "Ogre Fortress",
    filename: "20-ogre-fortress-b.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["oni", "island", "bag", "dog", "monkey", "pheasant"],
    templatePrompt: `Wide shot.

Camera eye-level looking toward a fortress gate.

Composition: traveler and companions hiding behind a rock in the foreground while ogres guard the fortress entrance in the background.

Child:
crouching and talking to the animals
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
standing beside the child, listening.

Monkey:
climbing a nearby rock, listening.

Pheasant:
perched nearby, listening.

3 Ogres:
large figures holding clubs
on the lookout
expressions angry and defensive.

Environment:
rocky island terrain
large fortress gate.${styleSuffix}`,
    fillOutOverride: { expression: "brave, steady, ready for confrontation" },
  },
  {
    page: 21,
    id: "ogre-infiltration",
    title: "Ogre Fortress Infiltration",
    filename: "21-ogre-infiltration-c.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "oni", "island", "bag"],
    templatePrompt: `Dynamic medium-wide shot.

Camera slightly low angle looking toward the fortress walls.

Composition: the fortress wall fills the background while the companions begin their clever infiltration.

Child:
standing in the foreground giving a quiet signal with one hand
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
running toward the fortress gate.

Monkey:
climbing the wooden gate or wall structure.

Pheasant:
flying upward over the fortress wall.

3 Ogres:
visible on the wall looking surprised and confused.

Environment:
large wooden fortress walls
rocky island ground
dramatic clouds and sea wind.${styleSuffix}`,
    fillOutOverride: { expression: "concentrated, strategic, alert" },
  },
  {
    page: 22,
    id: "battle-scene",
    title: "Battle Scene",
    filename: "22-battle-scene.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "oni", "island", "bag"],
    templatePrompt: `Dynamic wide action shot.

Camera slightly low angle looking upward to emphasize the action.

Composition: the traveler stands in the center of the courtyard directing the battle while three ogres are attacked by the animal companions around them.

Child:
standing in the center foreground
heroic stance pointing forward giving a command
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
lunging forward and biting firmly onto the wooden club of the first ogre
pulling the club downward.

Monkey:
clinging to the head and shoulders of a second ogre
pulling the ogre's hair and covering its eyes.

Pheasant:
flying through the air toward the third ogre
wings spread wide
pecking aggressively at the ogre's face.

Ogres:
three large ogres (red, blue, green)
each reacting differently to the attacks
one struggling to hold its club as the dog bites it
one stumbling while the monkey climbs on its head
one shielding its face from the attacking pheasant.

Environment:
stone courtyard inside the fortress walls
large wooden gate and towers behind them${styleSuffix}`,
    fillOutOverride: { expression: "heroic, commanding, fearless" },
  },
  {
    page: 23,
    id: "ogres-surrender",
    title: "Ogres Surrender",
    filename: "23-ogres-surrender.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["oni", "dog", "monkey", "pheasant", "bag"],
    templatePrompt: `Medium-wide shot.

Camera eye-level.

Composition: traveler and companions stand in the foreground while ogres bow respectfully in the background.

Child:
standing confidently
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

3 Ogres:
bowing in surrender.

Dog, Monkey, Pheasant:
standing proudly beside the traveler.

Environment:
fortress courtyard with treasure piles.${styleSuffix}`,
    fillOutOverride: { expression: "proud, calm, victorious" },
  },
  {
    page: 24,
    id: "take-treasure",
    title: "Taking the Treasure Home",
    filename: "24-take-treasure.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "oni", "island", "bag"],
    templatePrompt: `Wide shot.

Camera eye-level.

Composition: treasure chests and sacks are being carried toward a small wooden boat near the shore.

Child:
standing near the center directing the group
wearing a small blue travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.
Dog:
standing guard beside a pile of treasure.
Monkey:lifting a small treasure chest.
Pheasant:
perched on a rock watching.
3 Ogres:
bowing respectfully while offering treasure.
Environment:
rocky island shore
small wooden boat waiting at the water
waves gently touching the sand.${styleSuffix}`,
    fillOutOverride: { expression: "joyful, relieved, warmly happy" },
  },
  {
    page: 25,
    id: "saying-goodbye",
    title: "Saying Goodbye",
    filename: "25-saying-goodbye.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["dog", "monkey", "pheasant", "forest", "bag"],
    templatePrompt: `Medium-wide shot.

Camera eye-level.

Composition: child stands at the edge of the forest path saying goodbye as the animals depart in different directions.

Child:
standing and waving goodbye
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Dog:
trotting into the bushes.

Monkey:
climbing up a tall tree trunk.

Pheasant:
flying upward into the canopy.

Environment:
bamboo and pine trees surrounding the path
soft sunlight filtering through leaves.${styleSuffix}`,
    fillOutOverride: {
      expression: "peaceful, content, safe, looking at animals",
    },
  },
  {
    page: 26,
    id: "celebration",
    title: "Celebration",
    filename: "26-celebration.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "village", "bag"],
    templatePrompt: `Wide evening scene.

Camera eye-level.

Composition: villagers gather around the returning hero near the village house.

Child:
standing in the center
wearing a small travel bag
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Old Woman:
embracing the child.

Old Man:
standing nearby smiling proudly.

Villagers:
celebrating around them.

Environment:
lanterns glowing around the village.${styleSuffix}`,
    fillOutOverride: {
      expression: "peaceful, content, safe, happy, celebrating",
    },
  },
  {
    page: 27,
    id: "peaceful-ending",
    title: "Peaceful Ending",
    filename: "27-peaceful-ending-b.jpeg",
    phase: "child",
    hasProtagonist: true,
    referenceIds: ["old_woman", "old_man", "village", "bag"],
    templatePrompt: `Wide calm evening shot.

Camera slightly elevated.

Composition: the elderly couple and the child sit together outside their house near the river.

Child:
sitting between the couple
drawn as a blank graphite outline placeholder character with no facial features and no clothing.

Old Woman and Old Man:
relaxed and smiling peacefully.

Environment:
soft lantern light
quiet river reflecting the sky.${styleSuffix}`,
    fillOutOverride: { expression: "peaceful, content, safe" },
  },
];
