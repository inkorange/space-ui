---
"@inkorange/space-ui": minor
---

Drop `.Root` from every compound component, and collapse Select and
DropdownMenu to the parts that carry meaning.

`Select.Root` was never a choice — you always wrote it, always with a
`Trigger` you could not configure and a `Content` that only ever wrapped
`Item`s. Four names to express one control. It is now one component and one
child type:

```tsx
<Select value={star} onValueChange={setStar} placeholder="Pick one">
  <Select.Item value="G">G-type star</Select.Item>
</Select>
```

`DropdownMenu` goes the same way. Its trigger is always a Button now, passed
as `label`, so `DropdownMenuProps extends ButtonProps` and `size`, `iconOnly`
and the rest work on it directly.

The other five — `TextField`, `RadioGroup`, `Dialog`, `AlertDialog`, `Tabs` —
keep every part they had; only the wrapper name goes.

Breaking, and deliberately shipped as a minor: the package has one consumer
and it is migrating in the same change.

| Before | After |
| --- | --- |
| `<Select.Root>` + `<Select.Trigger />` + `<Select.Content>` | `<Select>` |
| `<DropdownMenu.Trigger><Button>M</Button></…>` | `<DropdownMenu label="M">` |
| `<TextField.Root />` | `<TextField />` |
| `<RadioGroup.Root>` | `<RadioGroup>` |
| `<Dialog.Root>` | `<Dialog>` |
| `<AlertDialog.Root>` | `<AlertDialog>` |
| `<Tabs.Root>` | `<Tabs>` |

Props that moved: `Select.Trigger`'s `placeholder` and `animated`, and
`DropdownMenu.Content`'s `align`, are now on their roots. Anything else you
pass a `Select` lands on the trigger button. Dropped: `Select.Content`'s
`position`, which only ever accepted one value and did nothing, and its
`className`, which existed to restyle a panel whose skin is not optional.
