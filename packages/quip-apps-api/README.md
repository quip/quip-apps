# Quip Apps API

---

This library is a stub of the actual Quip Live Apps API, which is documented
here: https://corp.quip.com/dev/liveapps/documentation.

The intent of this library is not to provide identical functionality as the
production live apps environment, but to allow rendering of Live Apps that rely
on the Quip API in test/placeholder environments, such as Jest or Storybook.

In production, this library will be replaced at runtime with a full-featured
API. To manually test your apps, follow the official instructions here:
https://corp.quip.com/dev/liveapps/#develop.

### Basic Usage:

install from npm:

```
npm install --save quip-apps-api
```

When you need to import the `quip.apps`/`quip.elements` namespace, instead
import from this library:

```javascript
import quip from "quip-apps-api";
```

This will be identical to using the global `quip` namespace when running inside
of a quip container, but will automatically be mocked when the global `quip`
does not exist.

### Mocking

In general, this libarary tries to make it easy to create fake envronments
without having to perform realistic data manipulation. This is acheived by
exposing a `values` property on all classes, which corresponds to the various
getters on that class. For example, if you want your test to have a record in a
specific state, instead of calling application methods that produce that state,
you can just set it directly on the record:

```
test("deleted record is not rendered", () => {
  const record = new CustomRecord()
  // you can just set these values directly to mock them.
  record.values.isDeleted = true
  const wrapper = shallow(<RecordView record={record}>)
  expect(wrapper).toMatchSnapshot()
})
```

When in doubt about which properties can be set or what side-effects to expect,
read the code or tests. This repo is intentionally fairly concise.

In some places, this implementation may not perform exactly like the production
interface. If you have a use case where this stub needs enhancement to get your
test code to better represent production, please file an issue. The goal is to
have a minimum useful subset of prod functionality without re-implementing
Quip's business logic.

In general, this will be in areas that can be expected to
be unit tested on our end, e.g. deleting records or performing quip-side actions
like opening modals or adding comments. As a rule of thumb, avoid writing tests
that test quip libraries, and assume that non-mutating actions are no-ops.
Things like creating and moving records should work as expected, as it's likeley
that your code depends on this functionality to work.
