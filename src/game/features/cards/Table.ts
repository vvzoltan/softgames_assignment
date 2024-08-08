import { Container } from "pixi.js";
import { GameContent } from "../GameContent";
import { Card, Rank, Suite } from "./Card";
import { Deck } from "./Deck";
import { gsap, Cubic, Sine } from "gsap";


export class Table extends Container implements GameContent {

    private readonly _deckLeft: Deck
    private readonly _deckRight: Deck
    private _interval?: NodeJS.Timeout
    private _timelines: gsap.core.Timeline[] = []

    static readonly CARDS = 144
    static readonly DRAW_INTERVAL = 1_000
    static readonly CARD_MOVE_DURATION = 2


    constructor() {
        super()

        this._deckLeft = new Deck([...this.generateCards()])
        this._deckRight = new Deck()
        this._deckLeft.cards.forEach(card => {this.addChild(card)})

        this._interval = setInterval(() => { this.moveCard() }, Table.DRAW_INTERVAL)
    }


    remove(): void {
        this.removeFromParent()
        if (this._interval) clearInterval(this._interval)
    }


    resize(width: number, height: number): void {
        this._timelines.forEach(timeline => timeline.totalProgress(1.0))
        this._deckLeft.coords.set(width / 4, height / 5)
        this._deckLeft.updateCardPositions()
        this._deckRight.coords.set((width / 4 * 3), height / 5)
        this._deckRight.updateCardPositions()
    }


    private moveCard() {
        if (this._deckLeft.cards.length == 0) {
            if (this._interval) clearInterval(this._interval)
            return
        }

        const card = this._deckLeft.cards.pop()!
        const destination = this._deckRight.topMostPosition()
        this._deckRight.cards.push(card)
        const timeline = gsap.timeline({
            onStart: () => {
                this._timelines.push(timeline)
            },
            onComplete: () => {
                const index = this._timelines.indexOf(timeline)
                if (index > -1) this._timelines.splice(index, 1)
            }
        })
        timeline.to(card.position, { x: destination.x, duration: Table.CARD_MOVE_DURATION, ease: Cubic.easeInOut }, 0)
        timeline.to(card.position, { y: Math.max(card.y, destination.y) + 50, duration: Table.CARD_MOVE_DURATION / 2, ease: Sine.easeOut }, 0)
        timeline.to(card.position, { y: destination.y, duration: Table.CARD_MOVE_DURATION / 2, ease: Sine.easeIn }, Table.CARD_MOVE_DURATION / 2)
        timeline.call(() => {
            card.flip()
            this.setChildIndex(card, this.children.length - 1)
        }, [], (Table.CARD_MOVE_DURATION / 2) - (Card.FLIP_DURATION / 2))
        timeline.play()
    }


    private *generateCards(): IterableIterator<Card> {
        const suites: Suite[] = ["clubs", "spades", "hearts", "diamonds"]
        const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k", "a"]
        for (let i = 0; i < Table.CARDS; i++) {
            const suite = Math.floor(Math.random() * suites.length)
            const rank = Math.floor(Math.random() * ranks.length)
            yield new Card(suites[suite], ranks[rank])
        }
    }
}