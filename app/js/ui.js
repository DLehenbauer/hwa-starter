const React = require('react');
const ReactDOM = require('react-dom');
const Model = require('./model');

(function () {
    var Bead = React.createClass({
        getInitialState: function() {
            return { size: 40 };
        },

        isUp: function(isSet) {
            return this.props.value === 5
                ? !isSet
                : isSet;
        },

        render: function() {
            const size = this.state.size;
            const center = size / 2;
            const radius = center - 1;

            const isHeavenlyBead = this.props.value === 5; 
            
            const className =
                'bead' +
                (isHeavenlyBead
                    ? ' heavenlyBead'
                    : ' earthlyBead') +
                (this.props.isSet
                    ? ' beadSet'
                    : ' beadUnset') +
                (this.isUp(this.props.isSet)
                    ? ' beadUp'
                    : ' beadDown');

            return (
              <div className={className} width="100%">
                <svg version="1.1" width={size} height={size}>
                  <circle onClick={this.handlePointerDown} cx={center} cy={center} r={radius} stroke="black" />
                </svg>
              </div>
            );
        },

        handlePointerDown: function() {
            this.props.toggle();
        }
    });

    var Rod = React.createClass({
        getInitialState: function () {
            return {
                heavenlyBead: 0,
                earthlyBeads: 0
            }
        },

        isSet: function (bead) {
            const value = this.props.value;
            switch (bead) {
                case 5:
                    return value >= 5;
                default:
                    return (value % 5) >= bead;
            }
        },

        toggleBead: function (bead) {
            switch (bead) {
                case 5:
                    this.setState({ heavenlyBead: this.state.heavenlyBead ^ 5 })
                    break;
                default:
                    this.setState({ earthlyBeads: this.isSet(bead)
                        ? bead - 1
                        : bead });
            }

            this.invariants();
        },

        invariants: function () {
            console.assert(this.state.heavenlyBead === 0 || this.state.heavenlyBead === 5,
                `The value of 'heavenlyBead' must be 0 or 5, but got '${this.heavenlyBead}'.`);
            console.assert(0 <= this.state.earthlyBeads && this.state.earthlyBeads <= 4,
                `The value of 'earthlyBead' must in the range 0..4 (inclusive), but got '${this.earthlyBeads}'.`);
        },

        makeBead: function (bead) {
            return (<Bead key={bead} value={bead} isSet={ this.isSet(bead) } toggle={() => { this.props.toggle(bead); }} />);
        },

        render: function () {
            const beads = [];
            beads.push(this.makeBead(5));
            for (let bead = 1; bead <= 4; bead++) {
                beads.push(this.makeBead(bead));
            }

            const digitClassName = 'digit' + 
                (this.props.showDigit
                    ? ''
                    : ' hidden');

            return (
              <div className="rod">
                {beads}
                <div className={digitClassName}>{this.props.value}</div>
              </div>
            );
        }
    });

    const Soroban = React.createClass({
        getInitialState: function () {
            const rods = []; 
            
            for (let place = this.props.rods; place >= 1; place--) {
                rods.push(new Model.Rod(place));
            }

            let say = (text) => {};

            if (typeof Windows !== 'undefined') {
                const audio = new Audio();
                const synth = new Windows.Media.SpeechSynthesis.SpeechSynthesizer();
                say = (text) => {
                    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><say-as interpret-as="cardinal">${text}</say-as></speak>`;

                    synth.synthesizeSsmlToStreamAsync(ssml)
                        .then((markersStream) => {
                            audio.src = URL.createObjectURL(
                                MSApp.createBlobFromRandomAccessStream(markersStream.ContentType, markersStream),
                                { oneTimeOnly: true });
                            audio.play();
                        }); 
                }
            }

            return {
                rods: rods, 
                values: rods.map(() => 0),
                say: say
            };
        },

        isDigitVisible: function (place) {
            let nonZero = false;
            
            for (let i = 0; i < place; i++) {
                if (rod.digit !== 0) {
                    return true;
                }
            }

            return false;
        },

        toggleBead: function (rod, bead) {
            const values = this.state.values;
            const value = values[rod];
            let heavenly = value >= 5;
            let earthly = value % 5;
            
            switch (bead) {
                case 5:
                    heavenly = !heavenly;
                    break;
                default:
                    earthly = value >= bead
                        ? bead - 1
                        : bead;
                    break;
            }

            values[rod] = earthly + (heavenly ? 5 : 0);
            this.setState({ values: values });
            this.forceUpdate();
        },

        getShouldInsertComma(previousNonZero, index) {
            return previousNonZero && index > 0 && (index % 3) === 0;
        },

        indexToPlace: function (index) {
            return this.state.values.length - index - 1; 
        },

        prependComma: function (index) {
            const exponent = this.indexToPlace(index);

        },

        getValue: function() {
            return this.state.values.reduce((sum, value, index) => {
                const exponent = this.indexToPlace(index);
                return sum + (value * Math.pow(10, exponent));
            }, 0);
        },

        render: function () {
            const numRods = this.state.rods.length;
            let foundNonZero = false;

            const rods = this.state.rods.map((rod, index) => {
                const place = numRods - index;
                const value = this.state.values[index];

                const toggle = (bead) => {
                    this.toggleBead(index, bead);
                };

                const result = [];
                
                if (this.getShouldInsertComma(foundNonZero, index)) {
                    const commaClassName = 'comma' +
                        (foundNonZero ? '' : ' hidden');
                    result.push(<div className={commaClassName}>,</div>)
                }

                foundNonZero |= value !== 0;
                result.push(<Rod key={index} value={value} showDigit={foundNonZero || place === 1} toggle={toggle} />);

                return result;
            });

            this.state.say(this.getValue());

            return (<div><span className="soroban">{rods}</span><span>{this.getValueInEnglish()}</span></div>);
        },

        getValueInEnglish: function () {
            function intToEnglish(value) {
                switch (value) {
                    case 19: return "nineteen";
                    case 18: return "eighteen";
                    case 17: return "seventeen";
                    case 16: return "sixteen";
                    case 15: return "fifteen";
                    case 14: return "fourteen";
                    case 13: return "thirteen";
                    case 12: return "twelve";
                    case 11: return "eleven";
                    case 10: return "ten";
                    case 9: return "nine";
                    case 8: return "eight";
                    case 7: return "seven";
                    case 6: return "six";
                    case 5: return "five";
                    case 4: return "four";
                    case 3: return "three";
                    case 2: return "two";
                    case 1: return "one";
                };

                const NS = [
                    {value: 1000000000000000000000, str: "sextillion"},
                    {value: 1000000000000000000, str: "quintillion"},
                    {value: 1000000000000000, str: "quadrillion"},
                    {value: 1000000000000, str: "trillion"},
                    {value: 1000000000, str: "billion"},
                    {value: 1000000, str: "million"},
                    {value: 1000, str: "thousand"},
                    {value: 100, str: "hundred"},
                    {value: 90, str: "ninety"},
                    {value: 80, str: "eighty"},
                    {value: 70, str: "seventy"},
                    {value: 60, str: "sixty"},
                    {value: 50, str: "fifty"},
                    {value: 40, str: "forty"},
                    {value: 30, str: "thirty"},
                    {value: 20, str: "twenty"},
                ];

                for (var n of NS) {
                    if (value >= n.value){
                        var t = Math.floor(value / n.value);
                        var d = value % n.value;
                        if( d > 0 ){
                            return intToEnglish(t) + ' ' + n.str + ' ' + intToEnglish(d);
                        } else {
                            return intToEnglish(t) + ' ' + n.str;
                        }
                    }
                }
            }
            
            return intToEnglish(this.getValue());
        }            
    });

    module.exports = {
        Soroban: Soroban
    };
}());
