import { gsap, Linear } from "gsap"
import { Sprite, Texture } from "pixi.js"
import { gameAssets } from "../../config/GameAssets"

export type Suite = "diamonds" | "hearts" | "clubs" | "spades"
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "j" | "q" | "k" | "a"


export class Card extends Sprite {

    private _showsFace: boolean = false

    static readonly FLIP_DURATION = 0.4


    constructor(readonly suite: Suite, readonly rank: Rank) {
        super(Texture.from(gameAssets.cardBack))
        this.anchor.set(0.5, 0.5)
    }


    showFront() {
        this.texture = this.getTexture(true)
    }


    showBack() {
        this.texture = this.getTexture(false)
    }

    
    flip() {
        const timeline = gsap.timeline()
        timeline.to(this.scale, { x: 0, duration: Card.FLIP_DURATION / 2, ease: Linear.easeIn })
        timeline.to(this.scale, {
            x: 1,
            duration: Card.FLIP_DURATION / 2,
            onStart: () => {
                this._showsFace = !this._showsFace
                if (this._showsFace) {
                    this.showFront()
                } else {
                    this.showBack()
                }
            },
            ease: Linear.easeOut
        })
        timeline.play()
    }


    private getTexture(front: boolean) {
        return Texture.from(front ? gameAssets.getCardFace(this.suite, this.rank) : gameAssets.cardBack)
    }

}