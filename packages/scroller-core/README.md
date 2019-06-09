# @smoovy/scroller-core
[![Version](https://flat.badgen.net/npm/v/@smoovy/scroller-core)](https://www.npmjs.com/package/@smoovy/scroller-core) ![Size](https://flat.badgen.net/bundlephobia/minzip/@smoovy/scroller-core)

The core architecture to implement any scroll experience you want!

## How it works
![Architecture](https://g.gravizo.com/source/scroller_core?https%3A%2F%2Fraw.githubusercontent.com%2Fdavideperozzi%2Fsmoovy%2Fmaster%2Fpackages%2Fscroller-core%2FREADME.md)

<details> 
<summary></summary>
scroller_core
  digraph G {
    ranksep=".5";
    rankdir="TB";

    subgraph cluster_triggers {
		    color=black;
        margin=10;
        dev[shape="octagon", label="Developer"]
        user[shape="octagon", label="User"]
    }

    input[label="Input \n (Mouse, touch, etc.)", shape="component"];
    transformer[label="Transformer", shape="component"];
    output[label="Output", shape="component"];
    virtPos[label="Virtual Position", shape="box"];
    outPos[label="Output Position", shape="box"];

    delta[label="Delta Δ", shape="box"];

    dev -> input [label="triggers"];
    user -> input [label="triggers"];

    input -> delta [label="emits"];
    delta -> virtPos [label="applies"];

    virt_changes[label="on changes"];
    virtPos -> virt_changes;
    virt_changes -> transformer [label="notifies"];

    out_changes[label="on changes"];
    outPos -> out_changes;
    out_changes -> output [label="notifies"];

    virtTransformComment[
        label="Transforms the virtual position. \n E.g. clamping values", 
        shape="underline", 
        fontcolor="gray", 
        color="gray"
    ];

    outTransformComment[
        label="Transforms the output position \n to the virtual position. \n E.g. animating values",
        shape="underline", 
        fontcolor="gray", 
        color="gray"
    ];

    virtTransform[label="virtualTransform()"];
    virtTransform -> virtTransformComment[dir="none", color="gray"];
    
    outTransform[label="outputTransform()"];
    outTransform -> outTransformComment[dir="none", color="gray"];

    virtTransform -> virtPos [label="receives & \n updates", dir="both"];
    outTransform -> outPos [label="receives & \n updates", dir="both"];

    transformer -> virtTransform;
    transformer -> outTransform;
  }
scroller_core
</details>

## Installation
```sh
npm install --save @smoovy/scroller-core
```

## Usage
Import the scroller as usual:
```js
import { Scroller } from '@smoovy/scroller-core';
```

## Development commands
```js
// Serve with parcel
npm run serve

// Build with rollup
npm run build

// Run Jest unit tests
npm run test

// Run TSLinter
npm run lint
```

## License
See the [LICENSE](../../LICENSE) file for license rights and limitations (MIT).
