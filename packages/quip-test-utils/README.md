# Quip Test Utils

---

This library contains some helpers intended to make testing Quip live Apps easier.

## Installation:

```
npm install --save-dev quip-test-utils
```

## APIs

### `applySnapshot(record: Record, data: SnapshotNode, legacyTypes: RecordPropertyDefinition = {})`

applySnapshot overwrites a record with the deserialized data from `data`, which
is presumed to be exported via the developer menu from a running live app. It is
useful when exporting a state that you would like to regression test or
otherwise write tests around, but would be challenging to manually recreate by
writing directly to records.

If your old snapshot contains properties that are no longer defined in
getProperties (e.g. if you're using a snapshot and have since deprecated a
property), you can pass those properties, as they were originally defined, as
the last argument.

### `runMigrations(manifest: Manifest, appVersion: number, record: quip.apps.RootRecord)`

runMigrations will apply any relevant migrations for the given app version to
the record passed. You will likely want to use this in combination with
applySnapshot and jest snapshots to verify that your migrations perform as
expected before publishing them:

```javascript
// src/model/root.test.js

import {RootRecord} from "./root";
import manifest from "../../manifest.json";
import recordWithFlipper from "../../test/fixtures/record-with-flipper.json";

test("v42 deprecates the 'flipper' field", () => {
  const root = new RootRecord();
  quip.testUtils.applySnapshot(root, recordWithFlipper);
  expect(root.get("flipper")).toMatchSnapshot();
  // manifest has a migration defined for version 42 that mutates "flipper"
  await quip.testUtils.runMigrations(manifest, 42, root);
  expect(root.get("flipper")).toMatchSnapshot();
});
```
