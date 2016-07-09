export class Rod {
    constructor(place) {
        this.place = place;
        this.heavenlyBead = 0;
        this.earthlyBeads = 0;
    }

    get digit() {
        return this.earthlyBeads + this.heavenlyBead;
    }

    isSet(bead) {
        switch (bead) {
            case 5:
                return this.heavenlyBead;
            default:
                console.assert(1 <= bead && bead < 5,
                    "'bead' must be in range 1..5 (inclusive).");
                return this.earthlyBeads >= bead;
        }
    }

    toggleBead(bead) {
        switch (bead) {
            case 5:
                this.heavenlyBead ^= 5;
                break;
            default:
                const wasSet = this.isSet(bead);
                this.earthlyBeads = wasSet
                    ? bead - 1
                    : bead;
        }

        this.invariants();
    }

    invariants() {
        console.assert(this.heavenlyBead === 0 || this.heavenlyBead === 5,
            `The value of 'heavenlyBead' must be 0 or 5, but got '{this.heavenlyBead}'.`);
        console.assert(0 <= this.earthlyBeads && this.earthlyBeads <= 4,
            `The value of 'earthlyBead' must in the range 0..4 (inclusive), but got '{this.earthlyBeads}'.`);
    }
}