import { Emitter, EmitterConfigV3 } from "@barvynkoa/particle-emitter";
import { Container, Ticker } from "pixi.js";
import { GameContent } from "../GameContent";


export class Fire extends Container implements GameContent {

    private readonly _particleContainer = new Container()

    constructor(private readonly ticker: Ticker) {
        super()
        this.addChild(this._particleContainer)
        const emitter = this.buildEmitter(this._particleContainer)
        this.ticker.add(ticker => emitter.update(ticker.deltaTime / 50))
    }


    remove(): void {
        this.removeFromParent()
    }


    resize(width: number, height: number): void {
        this._particleContainer.position.set(width / 2, height / 2)
    }


    private buildEmitter(container: Container): Emitter {
        const config: EmitterConfigV3 = {
            lifetime: {
                min: 0.5,
                max: 1.0
            },
            frequency: 0.1,
            emitterLifetime: -1,
            maxParticles: 10,
            pos: {
                x: 0,
                y: 0
            },
            addAtBack: false,
            behaviors: [
                {
                    type: 'textureRandom',
                    config: {
                        textures: ["particle1.png", "particle2.png"],
                    }
                },
                {
                    type: "moveAcceleration",
                    config: {
                        accel: {
                            x: 0,
                            y: -200
                        },
                        minStart: 0,
                        maxStart: 0,
                        rotate: false
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [{ value: 0.5, time: 0.0 }, { value: 1.0, time: 1.0 }],
                            isStepped: false
                        },
                        minMult: 1.0
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [{ value: '#6b3400', time: 0.0 }, { value: '#1d0101', time: 1.0 }]
                        },
                    }
                },
                {
                    type: 'blendMode',
                    config: {
                        blendMode: 'add',
                    }
                },
                {
                    type: "rotation",
                    config: {
                        minStart: -50,
                        maxStart: 50,
                        minSpeed: -180,
                        maxSpeed: 180,
                        accel: 20
                    }
                }
            ]
        }

        // There are issues with the Particle System in PixiJS v8 that require some not-so-nice workarounds to make it work
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitter = new Emitter(container as any, config)
        emitter.emit = true
        return emitter
    }

}