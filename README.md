🚵free
======

Bfree is an open source smart trainer software running entirely in a web
browser. The app is using Web Bluetooth to connect to BLE sensors and a
trainer. Currently the only trainer vendor supported is TACX.

No data is ever uploaded into any cloud service, and if such a features
will be ever implemented it will be totally opt-in. All the date remains
in your browser, plain text, currently in local storage. This might be
changed to something more secure in the future.


Getting Started
----------------

Bfree is built on top of [Next.js](https://nextjs.org/) and mostly what
applies to Next.js projects, should work here too.

### Prerequisites

At bare minimum you'll need a web browser that supports Web Bluetooth,
see [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#Browser_compatibility).

To build Bfree locally you'll need Node.js and `npm` or `yarn`.
The [official website](https://nodejs.org/en/) of the Node.js project
helps with that. Node.js itself ships with `npm` and nothing in this
project is using any `yarn` specific features, thus in general, whenever
you see an mention of `yarn`, it can be replaced with `npm`.

As normally with [Next.js](https://nextjs.org/) projects, the following
commands apply.

**Start in dev mode:**

```sh
yarn dev
```

or

```sh
npm run dev
```

**Run full build:**

```sh
yarn build
```

or

```sh
npm run build
```

**Start in production mode:**

```sh
yarn start
```

or

```sh
npm start
```

Running the build step is required before this.

### Next.js telemetry

The Next.js telemetry is disabled by default, as per GDPR this sort of things
should be opt-in.

You can opt-in for the telemetry by setting the `NEXT_TELEMETRY_DISABLED`
environment variable to 0.

**For example:**

```sh
NEXT_TELEMETRY_DISABLED=0 yarn build
```

License
-------

See [LICENSE.txt](/LICENSE.txt) and [NOTICE.md](/NOTICE.md).


Related Work
------------

While Bfree is not a derivative work the following open source projects have
been a great help in understanding how BLE, ANT+, and smart trainers work in
general.

- [jedla22/BleTrainerControl](https://github.com/jedla22/BleTrainerControl)
- [GoldenCheetah](https://github.com/GoldenCheetah/GoldenCheetah)


Useful Links
------------

- [TCX Schema](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd)
- [ThisIsAnt](https://www.thisisant.com/)
- [Bluetooth SIG - GATT specifications](https://www.bluetooth.com/specifications/gatt/)
