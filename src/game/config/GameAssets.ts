export const gameAssets = {

    background: "background.jpg",

    fullScreenEnter: "full_enter.png",
    fullScreenExit: "full_exit.png",

    cardBack: "cards/card_back.png",
    getCardFace: (suite: string, rank: string) => "cards/card_" + suite + "_" + rank + ".png",

    icons: {
        boo: "boo.png",
        coin: "coin.png", 
        flower: "flower.png",
        fuzzy: "fuzzy.png",
        goomba: "goomba.png",
        mushroom: "mushroom.png"
    },

    particles: ["particle1.png", "particle2.png"]

}