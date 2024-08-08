import { Point } from "pixi.js";
import { Card } from "./Card";


export class Deck {

    readonly cards: Card[]
    readonly coords: Point

    private static OFFSET = 3


    constructor(cards: Card[] = []) {
        this.coords = new Point(0, 0)
        this.cards = cards
        this.updateCardPositions();
    }


    positionForCard(index: number): Point {
        return new Point(this.coords.x, this.coords.y + (index * Deck.OFFSET))
    }


    topMostPosition(): Point {
        return this.positionForCard(this.cards.length)
    }


    updateCardPositions() {
        this.cards.forEach((card, index) => card.position = this.positionForCard(index))
    }

}