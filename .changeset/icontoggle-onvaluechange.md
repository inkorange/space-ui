---
"@inkorange/space-ui": major
---

Rename `IconToggle`'s `onChange` prop to `onValueChange`.

Every other controlled component in the library — Select, Slider, Tabs,
RadioGroup — names this `onValueChange`. IconToggle was the only one calling
it `onChange`, and that inconsistency had already caused a real bug: the
gallery's own story passed `onValueChange`, so the handler was `undefined`
and clicking an option threw instead of selecting it.

**Migration:** rename `onChange` to `onValueChange` on `IconToggle` call
sites. The signature is unchanged.
