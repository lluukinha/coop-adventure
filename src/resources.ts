import * as ex from "excalibur";

const Images: { [key: string]: ex.ImageSource } = {
    // Characters
    redSheetImage: new ex.ImageSource("/sprites/character-red-sheet.png"),
    blueSheetImage: new ex.ImageSource("/sprites/character-blue-sheet.png"),
    graySheetImage: new ex.ImageSource("/sprites/character-gray-sheet.png"),
    yellowSheetImage: new ex.ImageSource("/sprites/character-yellow-sheet.png"),

    // Monsters
    monsterSheetImage: new ex.ImageSource("/sprites/monster-sheet.png"),

    // Maps
    indoorImage: new ex.ImageSource("/maps/indoor.png"),

    // Weapons
    swordSheetImage: new ex.ImageSource("/sprites/sword-sheet.png"),
    arrowSheetImage: new ex.ImageSource("/sprites/arrow-sheet.png"),

    // Effects
    explosionSheetImage: new ex.ImageSource("/sprites/explosion-sheet.png")
};

const Sounds: { [key: string]: ex.ImageSource } = {

}

const loader = new ex.Loader();
loader.suppressPlayButton = true;
const allResources = { ...Images, ...Sounds };

for (const res in allResources) {
    loader.addResource(allResources[res]);
}

export { loader, Images, Sounds };